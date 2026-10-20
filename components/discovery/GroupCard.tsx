import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import CategoryLine from '@/components/ui/CategoryLine';
import Highlight from '@/components/ui/Highlight';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import RoleTag from '@/components/ui/RoleTag';
import { cityLabel } from '@/lib/city-label';
import { getSmartImageUrl } from '@/lib/image-utils';
import { langAttr } from '@/lib/translations';
import GroupCardActivity from './GroupCardActivity';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import { UI } from '@/lib/constants';
import type { DiscoveryParams } from '@/lib/discovery-params';
import type { MyRole } from '@/lib/types/own-area';

type Props = {
    group: GroupCardData;
    /** The group's latest activity for the bottom line: next visible meeting or newest public announcement (C2). */
    activity?: CardActivity;
    /** The discovery list's filters: the category links add to them. */
    filters?: DiscoveryParams;
    /** The search word, marked in the name. */
    highlight?: string;
    /** A group you belong to or wait for: the name is a plain link, so the full page loads with no panel in between (cmv9amjft). */
    fullPage?: boolean;
    /** Your role in the group (Manas grupas): the tag ends the place line; a plain member gets none (AR-09). */
    role?: MyRole;
    /** Join requests waiting for the team (Manas grupas, team only): a link to Biedri → Pieteikumi in the tagline's place (OD-21). */
    requestCount?: number;
};

const NAME_LINK = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * A group in a grid (AR-34): name, category line, place and members, the tagline; under a thin line the group's latest activity (none: no line); the photo (or the tone
 * and icon) at the right. Cards with a bottom line reserve the same lines (name 2, tagline 2, line 2); a grid row keeps one card height.
 */
export default function GroupCard({ group, activity, filters, highlight, fullPage = false, role, requestCount = 0 }: Props) {
    const t = useTranslations('discovery');
    const tMy = useTranslations('profile.myGroups');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const bottomLine = !!activity || !!group.lookingFor;

    return (
        <div
            data-ui={UI.groupCard}
            data-panel-origin={group.id}
            style={{ ['--c' as string]: group.category.color }}
            className="relative grid grid-cols-[minmax(0,1fr)_clamp(52px,20%,84px)] grid-rows-[1fr_auto] overflow-hidden rounded-2xl line bg-surface shadow-card transition-colors hover:bg-tint/40 has-[a[data-card-link]:focus-visible]:outline has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-primary shadow-card"
        >
            <div className={`flex min-w-0 flex-col gap-1.5 px-[var(--card-pad)] pt-[var(--card-pad)] ${bottomLine ? "" : "pb-[var(--card-pad)]"}`}>
                <h3 className="line-clamp-2 min-h-[2lh] text-item text-foreground">
                    {/* The stretched link: its ::after covers the card; the category links sit above it. */}
                    {fullPage
                        ? <a href={`/${locale}/${group.category.l1Slug}/group/${group.slug}`} data-card-link className={NAME_LINK}><Highlight text={group.name} word={highlight} /></a>
                        : <Link href={`/${group.category.l1Slug}/group/${group.slug}`} scroll={false} data-card-link data-opens-panel className={NAME_LINK}><Highlight text={group.name} word={highlight} /></Link>}
                </h3>
                <CategoryLine oneLine aboveCardLink color={group.category.color} category={group.category.l1Title} subCategories={group.subCategories} l1Slug={group.category.l1Slug} subSlugs={group.subCategorySlugs} from={filters} />
                <p className="flex min-w-0 items-center gap-2 text-meta text-foreground-muted">
                    <span className="truncate">{cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</span>
                    {role && <RoleTag role={role} />}
                </p>
                {requestCount > 0 ? (
                    // The team's waiting requests take the second tagline line, so every card keeps one height.
                    <div className="mt-1 min-h-[2lh] text-meta">
                        <p lang={group.tagline ? langAttr(group.taglineLang, locale) : undefined} className="line-clamp-1 text-foreground-muted">{group.tagline}</p>
                        <a href={`/${locale}/${group.category.l1Slug}/group/${group.slug}/members?tab=requests`} className="relative z-[2] weight-strong text-primary hover:underline">{tMy('requestCount', { count: requestCount })}</a>
                    </div>
                ) : (
                    <p lang={group.tagline ? langAttr(group.taglineLang, locale) : undefined} className="mt-1 line-clamp-2 min-h-[2lh] text-meta text-foreground-muted">{group.tagline}</p>
                )}
            </div>
            <GroupCardActivity activity={activity} lookingFor={group.lookingFor} />
            <div className="relative col-start-2 row-span-2 row-start-1 min-h-14 overflow-hidden cat-tile">
                {group.bannerImage ? (
                    <Image src={getSmartImageUrl(group.bannerImage)} alt="" fill sizes="320px" className="object-cover" />
                ) : (
                    <span className="absolute inset-0 grid place-items-center"><CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={26} /></span>
                )}
            </div>
        </div>
    );
}
