import type { GroupContext } from '@/lib/services/group.service';
import { getSmartImageUrl } from '@/lib/image-utils';
import type { GroupState } from './GroupProvider';

/** The service's group context as the frame's client state: titles only for sections, no section text. */
export function toGroupState(group: GroupContext): GroupState {
    return {
        id: group.id,
        slug: group.slug,
        name: group.name,
        href: `/${group.category.l1Slug}/group/${group.slug}`,
        image: group.bannerImage ? getSmartImageUrl(group.bannerImage) : null,
        isPrivate: group.type === 'PRIVATE',
        category: { l1Slug: group.category.l1Slug, l1Title: group.category.l1Title, subCategories: group.category.subCategories },
        city: group.city,
        memberCount: group.stats.memberCount,
        isAcceptingMembers: group.isAcceptingMembers,
        pages: group.pages,
        moderation: { isSiteAdmin: group.moderation.isSiteAdmin, hidden: !!group.moderation.hidden },
        user: group.user,
        pendingCount: group.stats.pendingCount,
        sections: group.sections.map(({ id, title, titleLang, order, visibility }) => ({ id, title, titleLang, order, visibility })),
    };
}
