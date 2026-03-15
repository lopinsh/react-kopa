import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { pusherServer } from '@/lib/pusher';

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

            // Verify they share a group
            const sharedGroups = await prisma.membership.findMany({
                where: {
                    userId: userId1,
                    group: {
                        members: {
                            some: { userId: userId2 }
                        }
                    }
                }
            });

            if (sharedGroups.length === 0) {
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
                    participants: true
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
            conversation.participants.forEach(participant => {
                pusherServer.trigger(
                    `private-user-${participant.id}`,
                    'new-message',
                    message
                );
            });

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
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[MessageService.blockConversation] Error:', error);
            throw new ActionError('UPDATE_FAILED');
        }
    }
};
