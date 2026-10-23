import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Highlight from '@/components/ui/Highlight';
import RoleTag from '@/components/ui/RoleTag';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cityLabel } from '@/lib/city-label';
import { getSmartImageUrl } from '@/lib/image-utils';
import ActivityNote from './ActivityNote';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { MyRole } from '@/lib/types/own-area';
import { UI } from '@/lib/constants';

const NAME_LINK = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * A group on a phone (R18, AR-36): a 56 px thumb (the picture, else the category tile), the name on up to two lines, the category line, and a mini tab chip with the note, else
 * city · members (no tagline, no faces). At the right edge, in Manas grupas, your role tag (Gaida for a waiting request); the team's waiting
 * requests are a link under the chip. The name is the stretched link, so the request link can sit above it.
 */
export default function GroupRow({ group, activity, highlight, replace = false, searchItem = false, fullPage = false, role, showMember = false, requestCount = 0 }: {
    group: GroupCardData;
    /** The group's latest activity for the chip's note. */
    activity?: CardActivity;
    /** The search word, marked in the name. */
    highlight?: string;
    /** Replace the history entry (a result of the search). */
    replace?: boolean;
    /** Marks the link for the search's arrow keys. */
    searchItem?: boolean;
    /** A group you belong to or wait for: a plain link to its full page (cmv9amjft). */
    fullPage?: boolean;
    /** Your role in the group (Manas grupas); a plain member gets no tag. */
    role?: MyRole | 'PENDING';
    /** Discovery: a plain member gets the quiet member tag too. */
    showMember?: boolean;
    /** Join requests waiting for the team (Manas grupas, team only). */
    requestCount?: number;
}) {
    const t = useTranslations('discovery');
    const tMy = useTranslations('profile.myGroups');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const topic = [group.category.l1Title, ...group.subCategories].join(' · ');
    const hasTag = !!role && !(role === 'MEMBER' && !showMember);
    const hasNote = !!activity?.event || !!activity?.announcement || !!group.lookingFor;
    const path = `/${group.category.l1Slug}/group/${group.slug}`;
    const name = <Highlight text={group.name} word={highlight} />;
    const searchAttr = searchItem ? { 'data-search-item': true } : {};

    return (
        <div
            data-ui={UI.groupRow}
            style={{ ['--c' as string]: group.category.color }}
            className="relative flex min-h-[5.5rem] items-center gap-3 border-t border-dashed border-border py-3 first:border-t-0 has-[a[data-row-link]:focus-visible]:outline has-[a[data-row-link]:focus-visible]:outline-2 has-[a[data-row-link]:focus-visible]:outline-primary"
        >
            {/* ui-allow: the 56 px thumb, a rounded picture or the category tile */}
            <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-item cat-tile">
                {group.bannerImage
                    ? <Image src={getSmartImageUrl(group.bannerImage)} alt="" fill sizes="56px" className="object-cover" />
                    : <CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={24} />}
            </span>
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-item text-foreground">
                    {fullPage
                        ? <a href={`/${locale}${path}`} data-row-link className={NAME_LINK} {...searchAttr}>{name}</a>
                        : <Link href={path} replace={replace} data-row-link className={NAME_LINK} {...searchAttr}>{name}</Link>}
                </span>
                <span className="mt-0.5 flex items-center text-meta text-foreground-muted">
                    <span aria-hidden="true" className="mr-1.5 size-2 shrink-0 rounded-full bg-[var(--c)]" />
                    <span className="min-w-0 truncate">{topic}</span>
                </span>
                <span className="mt-1.5 flex h-7 items-center rounded-item px-2 tab-tint text-meta text-foreground">
                    {hasNote
                        ? <span className="min-w-0 flex-1"><ActivityNote activity={activity} lookingFor={group.lookingFor} /></span>
                        : <span className="min-w-0 truncate text-foreground-muted">{cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</span>}
                </span>
                {requestCount > 0 && (
                    <a href={`/${locale}${path}/members?tab=requests`} className="relative z-[2] mt-0.5 block text-tag text-primary hover:underline after:absolute after:-inset-y-3 after:inset-x-0">{tMy('requestCount', { count: requestCount })}</a>
                )}
            </span>
            {hasTag && role && <RoleTag role={role} showMember={showMember} bright />}
        </div>
    );
}
