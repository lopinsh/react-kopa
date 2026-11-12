import { prisma } from '@/lib/prisma';
import { isSiteAdmin } from '@/lib/site-role';
import { plainExcerpt } from '@/lib/text-excerpt';
import { ActionError } from '@/types/actions';
import { ChatRequestService } from './chat-request.service';
import { TaxonomyResolver } from './taxonomy-resolver.service';

/** The name card (K5-19): what a signed-in reader sees when a name in a Čats line or the online list is tapped. Reuses profile data, no chat profile (K-81). */

export interface ChatCard {
    id: string;
    name: string;
    image: string | null;
    avatarSeed: string | null;
    status: string | null;
    mod: boolean;
    sharedGroups: Array<{ name: string; href: string }>;
    canRequest: 'yes' | 'open' | 'pending' | 'off' | 'self';
    /** The Ziņas conversation, when `canRequest` is `open`. */
    chatHref: string | null;
    /** Null when the person's profile is private or has no username. */
    profileHref: string | null;
}

const SHARED_MAX = 4;
const STATUS_MAX = 80;
const CHAIN = { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true } } } } } } as const;

export const ChatCardService = {
    async card(viewerId: string, userId: string): Promise<ChatCard> {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, image: true, avatarSeed: true, bio: true, role: true, username: true, isProfilePublic: true, allowDirectMessages: true } });
        if (!u) throw new ActionError('NOT_FOUND');
        const base = { id: u.id, name: u.name ?? '', image: u.image, avatarSeed: u.avatarSeed, mod: isSiteAdmin(u.role) };
        const profileHref = u.isProfilePublic && u.username ? `/profile/${u.username}` : null;
        const status = u.isProfilePublic ? plainExcerpt(u.bio, STATUS_MAX) : null;
        if (viewerId === userId) return { ...base, status, sharedGroups: [], canRequest: 'self', chatHref: null, profileHref };
        const [groups, chatId, waiting] = await Promise.all([
            prisma.group.findMany({
                where: { hiddenAt: null, AND: [{ members: { some: { userId: viewerId, role: { not: 'PENDING' } } } }, { members: { some: { userId, role: { not: 'PENDING' } } } }] },
                select: { name: true, slug: true, category: CHAIN },
                orderBy: { name: 'asc' },
                take: SHARED_MAX,
            }),
            ChatRequestService.chatWith(viewerId, userId),
            ChatRequestService.isWaiting(viewerId, userId),
        ]);
        const canRequest = chatId ? 'open' : waiting ? 'pending' : u.allowDirectMessages ? 'yes' : 'off';
        return {
            ...base, status, profileHref, canRequest,
            chatHref: chatId ? `/messages?c=${chatId}` : null,
            sharedGroups: groups.map((g) => ({ name: g.name, href: `/${TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}` })),
        };
    },
};
