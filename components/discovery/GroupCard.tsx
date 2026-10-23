import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Highlight from '@/components/ui/Highlight';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import RoleTag from '@/components/ui/RoleTag';
import { topicHref } from '@/lib/discovery-params';
import { cityLabel } from '@/lib/city-label';
import { getSmartImageUrl } from '@/lib/image-utils';
import { langAttr } from '@/lib/translations';
import GroupCardActivity from './GroupCardActivity';
import { cardRows, fitSubCategories } from './card-rows';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { Face } from '@/lib/services/event-panel';
import { UI } from '@/lib/constants';
import type { DiscoveryParams } from '@/lib/discovery-params';
import type { MyRole } from '@/lib/types/own-area';

type Props = {
    group: GroupCardData;
    /** The group's meeting, further meetings and newest public announcement: the tear-off rows. */
    activity?: CardActivity;
    /** The discovery list's filters: the Tēma and sub-category links add to them. */
    filters?: DiscoveryParams;
    /** The search word, marked in the name. */
    highlight?: string;
    /** A group you belong to or wait for: a plain `<a>`, so the full page loads fresh (cmv9amjft). */
    fullPage?: boolean;
    /** Members with a public profile, for signed-in viewers: up to three faces in the tear-off. */
    faces?: Face[];
    /** Your role in the group: the status sits on the picture's top right; a plain member gets one only on discovery (`showMember`). */
    role?: MyRole | 'PENDING';
    /** Discovery: a plain member gets the member status too. */
    showMember?: boolean;
    /** Join requests waiting for the team (Manas grupas, team only): a link to Biedri → Pieteikumi under the description. */
    requestCount?: number;
};

const NAME_LINK = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * A group as a note on the Ziņojumu dēlis (R21-G): a 7:2 picture (or the Tēma-colour area with its pattern and icon) with the Tēma pill and the city on its bottom edge and
 * your status top right; the white body: name, sub-categories, the bold line (what we are looking for), the description; the tear-off: a meeting and an announcement, faces,
 * members, the round contact button. The card keeps one height (24rem). On hover the picture shrinks to a strip and the tear-off rows come in.
 * Click anywhere opens the group's page; event pop-ups come from the events themselves.
 */
export default function GroupCard({ group, activity, filters, highlight, fullPage = false, faces = [], role, showMember = false, requestCount = 0 }: Props) {
    const t = useTranslations('discovery');
    const tMy = useTranslations('profile.myGroups');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const hasTag = !!role && !(role === 'MEMBER' && !showMember);
    const rows = cardRows(group.tagline, !!activity?.event, !!activity?.announcement);
    const { shown, more } = fitSubCategories(group.subCategories.map((title, i) => ({ title, value: group.subCategorySlugs[i] })));
    const path = `/${group.category.l1Slug}/group/${group.slug}`;
    const name = <Highlight text={group.name} word={highlight} />;
    // The team has no one to write to; everyone else (a visitor, a waiting request, a member) may write to the organisers.
    const contact = role === 'OWNER' || role === 'ADMIN' ? null : { groupId: group.id, groupName: group.name, allowJoin: role === undefined && group.isAcceptingMembers };
    const area = 'relative h-[calc(100cqw*2/7)] overflow-hidden rounded-t-2xl transition-[height] duration-slow ease-standard motion-reduce:transition-none live:h-9';

    return (
        <div
            data-ui={UI.groupCard}
            style={{ ['--c' as string]: group.category.color, ['--rc' as string]: rows.restLines, ['--hc' as string]: rows.hoverLines }}
            className="group/card card-note relative flex flex-col rounded-2xl line bg-surface shadow-card md:h-96 has-[a[data-card-link]:focus-visible]:outline has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-primary"
        >
            <div className="relative shrink-0 [container-type:inline-size]">
                {group.bannerImage ? (
                    <div className={`${area} cat-tile`}>
                        <Image src={getSmartImageUrl(group.bannerImage)} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
                        {hasTag && role && <span className="absolute right-2 top-2 transition-[top] motion-reduce:transition-none live:top-1"><RoleTag role={role} showMember={showMember} bright /></span>}
                    </div>
                ) : (
                    // No picture: the Tēma-colour area with the diamond pattern and the Tēma icon centred and large; on hover it shrinks and slides to the left of the strip (the edge pill names the Tēma).
                    <div className={`${area} band-tint glyph-pattern`}>
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-left transition-[left,translate,scale] duration-slow ease-standard motion-reduce:transition-none live:left-[var(--card-pad)] live:translate-x-0 live:scale-[0.4]"><CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={44} /></span>
                        {hasTag && role && <span className="absolute right-2 top-2 transition-[top] motion-reduce:transition-none live:top-1"><RoleTag role={role} showMember={showMember} bright /></span>}
                    </div>
                )}
                <div className="absolute inset-x-4 -bottom-3 z-[2] flex min-w-0 gap-1.5">
                    <Link
                        href={topicHref(group.category.l1Slug, undefined, filters)}
                        aria-label={t('stickerLabel', { category: group.category.l1Title })}
                        className="flex min-w-0 max-w-[60%] items-center rounded-pill line px-3 py-1 text-tag weight-strong shadow-control sticker"
                    >
                        <span className="truncate">{group.category.l1Title}</span>
                    </Link>
                    <span className="flex min-w-0 items-center gap-1 rounded-pill line bg-surface px-2 py-1 text-tag weight-strong text-foreground shadow-control">
                        <MapPin aria-hidden="true" className="size-3 shrink-0 text-foreground-muted" />
                        <span className="truncate">{cityLabel(tCities, group.city)}</span>
                    </span>
                </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden px-[var(--card-pad)] pb-3 pt-6">
                <h3 className="line-clamp-2 shrink-0 text-item text-foreground">
                    {/* The stretched link: its ::after covers the card; the Tēma pill, sub-categories and event links sit above it. */}
                    {fullPage
                        ? <a href={`/${locale}${path}`} data-card-link className={NAME_LINK}>{name}</a>
                        : <Link href={path} data-card-link className={NAME_LINK}>{name}</Link>}
                </h3>
                {shown.length > 0 && (
                    <p className="flex shrink-0 gap-1.5 whitespace-nowrap text-meta text-foreground-muted">
                        <span className="min-w-0 truncate">
                            {shown.map((s, i) => (
                                <span key={s.value ?? s.title}>
                                    {i > 0 && ', '}
                                    <Link href={topicHref(group.category.l1Slug, s.value, filters)} className="relative z-10 hover:underline">{s.title}</Link>
                                </span>
                            ))}
                        </span>
                        {more > 0 && <span className="shrink-0 text-foreground">+{more}</span>}
                    </p>
                )}
                {group.lookingFor && <p className="line-clamp-2 shrink-0 text-meta weight-strong text-foreground">{group.lookingFor}</p>}
                {group.tagline && <p lang={langAttr(group.taglineLang, locale)} className="min-h-0 line-clamp-(--rc) text-meta text-foreground live:line-clamp-(--hc)">{group.tagline}</p>}
                {requestCount > 0 && (
                    <a href={`/${locale}${path}/members?tab=requests`} className="relative z-[2] shrink-0 text-meta weight-strong text-primary hover:underline after:absolute after:-inset-y-2 after:inset-x-0">{tMy('requestCount', { count: requestCount })}</a>
                )}
            </div>
            <GroupCardActivity activity={activity} rows={rows} eventsHref={`${path}/events`} faces={faces} memberCount={group.memberCount} contact={contact} />
        </div>
    );
}
