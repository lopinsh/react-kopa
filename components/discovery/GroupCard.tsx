import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import CategoryLine from '@/components/ui/CategoryLine';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cityLabel } from '@/lib/city-label';
import { EVENT_DAY, useDateFormatter } from '@/lib/date-format';
import { getSmartImageUrl } from '@/lib/image-utils';
import type { GroupCardData } from '@/lib/services/group-card';
import { UI } from '@/lib/constants';
import { clsx } from 'clsx';

type Props = {
    group: GroupCardData;
    /** Start of the group's next visible meeting; shown when the group has no "Ko meklējam?" line. */
    nextMeeting?: Date | null;
};

/** A group in a grid (AR-34): name, category line, place and members; under a thin line the group's note; the photo (or the tone and icon) at the right. */
export default function GroupCard({ group, nextMeeting }: Props) {
    const t = useTranslations('discovery');
    const tCities = useTranslations('cities');
    const formatter = useDateFormatter();
    const hasNote = !!group.lookingFor || !!nextMeeting;

    return (
        <Link
            href={`/${group.category.l1Slug}/group/${group.slug}`}
            data-ui={UI.groupCard}
            style={{ ['--c' as string]: group.category.color }}
            className="grid grid-cols-[minmax(0,1fr)_clamp(52px,20%,84px)] grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-surface transition-colors hover:bg-tint/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
            <div className={clsx('flex min-w-0 flex-col gap-[3px] px-3.5 pt-3', !hasNote && 'pb-3')}>
                <h3 className="line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-foreground">{group.name}</h3>
                <CategoryLine oneLine color={group.category.color} category={group.category.l1Title} subCategories={group.subCategories} />
                <p className="truncate text-[13px] text-foreground-muted">{cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</p>
            </div>
            {hasNote && (
                <p className="col-start-1 row-start-2 mx-3.5 mt-2 flex items-start gap-1.5 border-t border-border pb-[11px] pt-2 text-[13px] italic text-primary">
                    {group.lookingFor ? group.lookingFor : (
                        <>
                            <CalendarDays aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                            <span>{t('nextMeeting', { date: formatter.dateTime(nextMeeting as Date, EVENT_DAY) })}</span>
                        </>
                    )}
                </p>
            )}
            <div className="relative col-start-2 row-span-2 row-start-1 min-h-14 overflow-hidden bg-[color-mix(in_srgb,var(--c)_20%,var(--surface))] text-[var(--c)]">
                {group.bannerImage ? (
                    <Image src={getSmartImageUrl(group.bannerImage)} alt="" fill sizes="84px" className="object-cover" />
                ) : (
                    <span className="absolute inset-0 grid place-items-center"><CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={26} /></span>
                )}
            </div>
        </Link>
    );
}
