import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Highlight from '@/components/ui/Highlight';
import RoleTag from '@/components/ui/RoleTag';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cityLabel } from '@/lib/city-label';
import { langAttr } from '@/lib/translations';
import type { GroupCardData } from '@/lib/services/group-card';
import type { MyRole } from '@/lib/types/own-area';
import { UI } from '@/lib/constants';

const NAME_LINK = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * A group on a phone (AR-36): name up to two lines, one quiet line (sub-categories give way first), the tagline, the tone mark at the right.
 * No photo, no note. In Manas grupas it also carries your role before the tone mark and, for the team, the waiting requests as a third line.
 * The name is the stretched link, so the request link can sit above it.
 */
export default function GroupRow({ group, highlight, replace = false, searchItem = false, fullPage = false, role, requestCount = 0 }: {
    group: GroupCardData;
    /** The search word, marked in the name. */
    highlight?: string;
    /** Replace the history entry (a result of the search). */
    replace?: boolean;
    /** Marks the link for the search's arrow keys. */
    searchItem?: boolean;
    /** A group you belong to or wait for: a plain link to its full page, no panel (cmv9amjft). */
    fullPage?: boolean;
    /** Your role in the group (Manas grupas); a plain member gets no tag. */
    role?: MyRole | 'PENDING';
    /** Join requests waiting for the team (Manas grupas, team only). */
    requestCount?: number;
}) {
    const t = useTranslations('discovery');
    const tMy = useTranslations('profile.myGroups');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const topic = [group.category.l1Title, ...group.subCategories].join(' · ');
    const path = `/${group.category.l1Slug}/group/${group.slug}`;
    const name = <Highlight text={group.name} word={highlight} />;
    const searchAttr = searchItem ? { 'data-search-item': true } : {};

    return (
        <div
            data-ui={UI.groupRow}
            data-panel-origin={group.id}
            style={{ ['--c' as string]: group.category.color }}
            className="relative flex min-h-14 items-center gap-2.5 border-t border-border py-2.5 first:border-t-0 has-[a[data-row-link]:focus-visible]:outline has-[a[data-row-link]:focus-visible]:outline-2 has-[a[data-row-link]:focus-visible]:outline-primary"
        >
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block font-heading text-[15px] font-semibold leading-snug text-foreground">
                    {fullPage
                        ? <a href={`/${locale}${path}`} data-row-link className={NAME_LINK} {...searchAttr}>{name}</a>
                        : <Link href={path} scroll={false} replace={replace} data-row-link data-opens-panel={replace ? undefined : true} className={NAME_LINK} {...searchAttr}>{name}</Link>}
                </span>
                <span className="mt-0.5 flex items-center text-xs text-foreground-muted">
                    <span aria-hidden="true" className="mr-1.5 size-2 shrink-0 rounded-full bg-[var(--c)]" />
                    <span className="min-w-0 truncate">{topic}</span>
                    <span className="shrink-0 whitespace-pre"> · {cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</span>
                </span>
                {requestCount > 0 && (
                    <a href={`/${locale}${path}/members?tab=requests`} className="relative z-[2] mt-0.5 block text-xs font-semibold text-primary hover:underline">{tMy('requestCount', { count: requestCount })}</a>
                )}
                {group.tagline && <span lang={langAttr(group.taglineLang, locale)} className="mt-0.5 block truncate text-xs text-foreground-muted">{group.tagline}</span>}
            </span>
            {role && <RoleTag role={role} />}
            <span className="grid size-10 shrink-0 place-items-center rounded-item cat-tile">
                <CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={20} />
            </span>
        </div>
    );
}
