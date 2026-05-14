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
            if (userId1 === userId2) throw new ActionError('FORBIDDEN');

            // Find existing conversation
            const existing = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: userId1 } } },
                        { participants: { some: { id: userId2 } } }
                    ]
                },
                include: {
                    participants: { select: { id: true, name: true, image: true } }
                }
            });

            if (existing) return existing;

            // Verify they share a group and the permissions are correct
            const sharedGroups = await prisma.membership.findMany({
                where: {
                    userId: userId1,
                    group: {
                        members: {
                            some: {
                                userId: userId2
                            }
                        }
                    }
                },
                include: {
                    group: {
                        include: {
                            members: {
                                where: {
                                    userId: { in: [userId1, userId2] }
                                }
                            }
                        }
                    }
                }
            });

            const canChat = sharedGroups.some(m => {
                const g = m.group;
                const m1 = g.members.find(mb => mb.userId === userId1);
                const m2 = g.members.find(mb => mb.userId === userId2);
                if (!m1 || !m2) return false;

                const isM1Admin = m1.role === MembershipRole.OWNER || m1.role === MembershipRole.ADMIN;
                const isM2Admin = m2.role === MembershipRole.OWNER || m2.role === MembershipRole.ADMIN;
                const isM1Member = m1.role === MembershipRole.MEMBER;
                const isM2Member = m2.role === MembershipRole.MEMBER;

                // Case 1: Both are at least members
                if ((isM1Admin || isM1Member) && (isM2Admin || isM2Member)) return true;

                // Case 2: One is Admin, the other is Pending (allows admins to contact applicants)
                if (isM1Admin && m2.role === MembershipRole.PENDING) return true;
                if (isM2Admin && m1.role === MembershipRole.PENDING) return true;

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
        } catch (error) {
            if (error instanceof ActionError) throw error;
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
        } catch (error) {
            if (error instanceof ActionError) throw error;
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
        } catch (error) {
            if (error instanceof ActionError) throw error;
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
                        role: { in: [MembershipRole.ADMIN, MembershipRole.OWNER] },
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
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[MessageService.blockConversation] Error:', error);
            throw new ActionError('UPDATE_FAILED');
        }
    }
};
