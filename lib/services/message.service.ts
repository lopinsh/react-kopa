import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { pusherServer } from '@/lib/pusher';
import { MembershipRole } from '@prisma/client';

export const MessageService = {
    async getConversations(userId: string) {
        try {
            return await prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { id: userId }
                    }
                },
                include: {
                    participants: {
                        select: { id: true, name: true, image: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } catch (error) {
            console.error('[MessageService.getConversations] Error:', error);
            return [];
        }
    },

    async getOrCreateConversation(userId1: string, userId2: string) {
        try {
            if (!userId1 || !userId2 || userId1 === userId2) throw new ActionError('FORBIDDEN');

            // Find existing conversation (manual filter for maximum reliability)
            const userConversations = await prisma.conversation.findMany({
                where: {
                    participants: { some: { id: userId1 } }
                },
                include: {
                    participants: { select: { id: true, name: true, image: true } }
                }
            });

            const existing = userConversations.find(conv =>
                conv.participants.length === 2 &&
                conv.participants.some(p => p.id === userId2)
            );

            if (existing) return existing;

            // Check if they share any groups and what their roles are
            const memberships = await prisma.membership.findMany({
                where: {
                    userId: { in: [userId1, userId2] }
                },
                select: {
                    groupId: true,
                    userId: true,
                    role: true
                }
            });

            // Manual grouping for maximum reliability
            const groupRoles: Record<string, { role1?: string, role2?: string }> = {};
            for (const m of memberships) {
                if (!groupRoles[m.groupId]) groupRoles[m.groupId] = {};
                if (m.userId === userId1) groupRoles[m.groupId].role1 = m.role as string;
                if (m.userId === userId2) groupRoles[m.groupId].role2 = m.role as string;
            }

            const canChat = Object.values(groupRoles).some(({ role1, role2 }) => {
                if (!role1 || !role2) return false;

                const is1Admin = role1 === 'OWNER' || role1 === 'ADMIN';
                const is2Admin = role2 === 'OWNER' || role2 === 'ADMIN';
                const is1Member = role1 === 'MEMBER';
                const is2Member = role2 === 'MEMBER';

                // Case 1: Both are at least members
                if ((is1Admin || is1Member) && (is2Admin || is2Member)) return true;

                // Case 2: Admin contacting a Pending applicant
                if (is1Admin && role2 === 'PENDING') return true;
                if (is2Admin && role1 === 'PENDING') return true;

                return false;
            });

            if (!canChat) {
                throw new ActionError('FORBIDDEN');
            }

            // Create new conversation
            return await prisma.conversation.create({
                data: {
                    participants: {
                        connect: [{ id: userId1 }, { id: userId2 }]
                    }
                },
                include: {
                    participants: { select: { id: true, name: true, image: true } }
                }
            });
        } catch (error: any) {
            if (error.name === 'ActionError') throw error;
            console.error('[MessageService.getOrCreateConversation] Error:', error);
            throw new ActionError('CREATE_FAILED');
        }
    },

    async getMessages(conversationId: string, userId: string) {
        try {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: { some: { id: userId } }
                }
            });

            if (!conversation) throw new ActionError('NOT_FOUND');

            return await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: { select: { id: true, name: true, image: true } }
                }
            });
        } catch (error: any) {
            if (error.name === 'ActionError') throw error;
            console.error('[MessageService.getMessages] Error:', error);
            return [];
        }
    },

    async sendMessage(conversationId: string, senderId: string, content: string) {
        try {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: { some: { id: senderId } }
                },
                include: {
                    participants: {
                        select: { id: true }
                    }
                }
            });

            if (!conversation) throw new ActionError('NOT_FOUND');
            if (conversation.isBlocked) throw new ActionError('FORBIDDEN');

            const message = await prisma.message.create({
                data: {
                    content,
                    conversationId,
                    senderId
                },
                include: {
                    sender: { select: { id: true, name: true, image: true } }
                }
            });

            // Update conversation updatedAt timestamp
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });

            // Trigger Pusher events for all participants
            try {
                conversation.participants.forEach(participant => {
                    pusherServer.trigger(
                        `private-user-${participant.id}`,
                        'new-message',
                        {
                            ...message,
                            createdAt: message.createdAt.toISOString()
                        }
                    );
                });
            } catch (pusherError) {
                console.error('[MessageService.sendMessage] Pusher trigger failed:', pusherError);
            }

            return message;
        } catch (error: any) {
            if (error.name === 'ActionError') throw error;
            console.error('[MessageService.sendMessage] Error:', error);
            throw new ActionError('POST_FAILED');
        }
    },

    async blockConversation(conversationId: string, userId: string, isBlocked: boolean) {
        try {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: { some: { id: userId } }
                }
            });

            if (!conversation) throw new ActionError('NOT_FOUND');

            // Find the other participant to check if they are an admin/owner IN A SHARED GROUP
            const otherParticipantId = await prisma.user.findFirst({
                where: {
                    conversations: { some: { id: conversationId } },
                    id: { not: userId }
                },
                select: { id: true }
            });

            if (otherParticipantId) {
                const sharedAdminMembership = await prisma.membership.findFirst({
                    where: {
                        userId: otherParticipantId.id,
                        role: { in: ['ADMIN', 'OWNER'] },
                        group: {
                            members: {
                                some: { userId } // Only check groups the current user is also in
                            }
                        }
                    }
                });

                if (sharedAdminMembership && isBlocked) {
                    throw new ActionError('FORBIDDEN'); // Cannot block admins/owners of shared groups
                }
            }


            return await prisma.conversation.update({
                where: { id: conversationId },
                data: { isBlocked }
            });
        } catch (error: any) {
            if (error.name === 'ActionError') throw error;
            console.error('[MessageService.blockConversation] Error:', error);
            throw new ActionError('UPDATE_FAILED');
        }
    }
};
