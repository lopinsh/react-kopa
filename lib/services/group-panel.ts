import { PANEL_TEXT_MAX } from '@/lib/constants';
import { plainExcerpt } from '@/lib/text-excerpt';
import type { TextLang } from '@/lib/translations';
import type { GroupContext } from './group.service';
import type { NextEventView } from './event.service';

/** What the opened group card (R6) shows: no sections, pages, tags, social links or moderation data ever leave with it. */
export interface GroupPanelData {
    id: string;
    name: string;
    slug: string;
    l1Slug: string;
    category: { l1Title: string; color: string; subCategories: string[] };
    city: string;
    memberCount: number;
    image: string | null;
    /** The home section's first words (only when this viewer may read it), plain text, at most PANEL_TEXT_MAX. */
    text: string | null;
    textLang: TextLang;
    nextMeeting: Pick<NextEventView, 'slug' | 'title' | 'titleLang' | 'startDate'> | null;
    viewer: {
        /** "Sazināties": a visitor (not a member, not waiting) and the group is not hidden. */
        canContact: boolean;
        isAcceptingMembers: boolean;
        /** The viewer's request waits: the pending view with "Atvērt sarunu". */
        pending: { chatId: string | null } | null;
        /** Members and the team: "Atvērt grupas lapu" is the main button. */
        isMember: boolean;
    };
}

/** Narrows a group context (already cut to what this viewer may see) and the group's next visible event to the panel. */
export function toGroupPanel(g: GroupContext, next: NextEventView | null): GroupPanelData {
    const home = g.sections.find((s) => s.order === 0);
    const isPending = g.user.role === 'PENDING';
    const canContact = !g.user.isMember && !isPending && !g.moderation.hidden;
    return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        l1Slug: g.category.l1Slug,
        category: { l1Title: g.category.l1Title, color: g.theme.accentColor, subCategories: g.category.subCategories },
        city: g.city,
        memberCount: g.stats.memberCount,
        image: g.bannerImage,
        text: home ? plainExcerpt(home.content, PANEL_TEXT_MAX) : null,
        textLang: home?.contentLang ?? 'lv',
        nextMeeting: next ? { slug: next.slug, title: next.title, titleLang: next.titleLang, startDate: next.startDate } : null,
        viewer: {
            canContact,
            isAcceptingMembers: g.isAcceptingMembers,
            pending: isPending ? { chatId: g.user.chatId } : null,
            isMember: !canContact && !isPending
        }
    };
}
