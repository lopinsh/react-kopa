import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import CategoryLine from '@/components/ui/CategoryLine';
import Highlight from '@/components/ui/Highlight';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import RoleTag from '@/components/ui/RoleTag';
import Faces from '@/components/ui/Faces';
import { cityLabel } from '@/lib/city-label';
import { getSmartImageUrl } from '@/lib/image-utils';
import { langAttr } from '@/lib/translations';
import GroupCardActivity from './GroupCardActivity';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { Face } from '@/lib/services/event-panel';
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
    /** Members with a public profile, for signed-in viewers: up to three faces and "+N" on the picture's bottom right. */
    faces?: Face[];
    /** Your role in the group (Manas grupas): the tag sits on the picture's top right; a plain member gets none (AR-09) except on discovery (`showMember`). */
    role?: MyRole | 'PENDING';
    /** Discovery: a plain member gets the quiet member tag too. */
    showMember?: boolean;
    /** Join requests waiting for the team (Manas grupas, team only): a link to Biedri → Pieteikumi in the tagline's place (OD-21). */
    requestCount?: number;
};

const NAME_LINK = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * A group in a grid (AR-34): a short photo band on top, 5:2 (none: a slim category strip with icon and name), then name, category line, place and members, the tagline; under a thin line the group's
 * latest activity (none: no line). Cards with a bottom line reserve the same lines (name 2, tagline 2, line 2); a grid row keeps one card height.
 */
export default function GroupCard({ group, activity, filters, highlight, fullPage = false, faces = [], role, showMember = false, requestCount = 0 }: Props) {
    const t = useTranslations('discovery');
    const tMy = useTranslations('profile.myGroups');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const bottomLine = !!activity || !!group.lookingFor;
    const hasTag = !!role && !(role === 'MEMBER' && !showMember);
    const tagEl = (cls: string) => hasTag && role && <span className={`absolute right-2 ${cls}`}><RoleTag role={role} showMember={showMember} /></span>;
    const chip = faces.length > 0 && (
        <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-pill bg-photo-chip py-1 pl-1.5 pr-2 text-tag text-photo-ink">
            <Faces faces={faces} size="lg" ring="ring-photo-ink" />
            {group.memberCount > faces.length && <span className="weight-strong">+{group.memberCount - faces.length}</span>}
        </span>
    );

    return (
        <div
            data-ui={UI.groupCard}
            data-panel-origin={group.id}
            style={{ ['--c' as string]: group.category.color }}
            className="relative flex flex-col overflow-hidden rounded-2xl line bg-surface shadow-card has-[a[data-card-link]:focus-visible]:outline has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-primary shadow-card"
        >
            {group.bannerImage ? (
                <div className="relative aspect-[5/2] overflow-hidden cat-tile">
                    <Image src={getSmartImageUrl(group.bannerImage)} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
                    {tagEl('top-2')}
                    {chip}
                </div>
            ) : (
                <div className="relative flex min-h-10 items-center gap-2 overflow-hidden cat-tile px-[var(--card-pad)] py-2 pr-24">
                    <CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={20} />
                    <span className="truncate text-meta weight-strong">{group.category.l1Title}</span>
                    {tagEl('top-1/2 -translate-y-1/2')}
                </div>
            )}
            <div className={`flex min-w-0 flex-1 flex-col gap-1.5 px-[var(--card-pad)] pt-[var(--card-pad)] ${bottomLine ? "" : "pb-[var(--card-pad)]"}`}>
                <h3 className="line-clamp-2 min-h-[2lh] text-item text-foreground">
                    {/* The stretched link: its ::after covers the card; the category links sit above it. */}
                    {fullPage
                        ? <a href={`/${locale}/${group.category.l1Slug}/group/${group.slug}`} data-card-link className={NAME_LINK}><Highlight text={group.name} word={highlight} /></a>
                        : <Link href={`/${group.category.l1Slug}/group/${group.slug}`} scroll={false} data-card-link data-opens-panel className={NAME_LINK}><Highlight text={group.name} word={highlight} /></Link>}
                </h3>
                <CategoryLine oneLine aboveCardLink color={group.category.color} category={group.category.l1Title} subCategories={group.subCategories} l1Slug={group.category.l1Slug} subSlugs={group.subCategorySlugs} from={filters} />
                <p className="truncate text-meta text-foreground-muted">{cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</p>
                {requestCount > 0 ? (
                    // The team's waiting requests take the second tagline line, so every card keeps one height.
                    <div className="mt-1 min-h-[2lh] text-meta">
                        <p lang={group.tagline ? langAttr(group.taglineLang, locale) : undefined} className="line-clamp-1 text-foreground">{group.tagline}</p>
                        <a href={`/${locale}/${group.category.l1Slug}/group/${group.slug}/members?tab=requests`} className="relative z-[2] weight-strong text-primary hover:underline">{tMy('requestCount', { count: requestCount })}</a>
                    </div>
                ) : (
                    <p lang={group.tagline ? langAttr(group.taglineLang, locale) : undefined} className="mt-1 line-clamp-2 min-h-[2lh] text-meta text-foreground">{group.tagline}</p>
                )}
            </div>
            <GroupCardActivity activity={activity} lookingFor={group.lookingFor} />
        </div>
    );
}
