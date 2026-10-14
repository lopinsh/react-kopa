import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { cityLabel } from '@/lib/city-label';
import { langAttr } from '@/lib/translations';
import type { GroupCardData } from '@/lib/services/group-card';
import { UI } from '@/lib/constants';

/** A group on a phone (AR-36): name up to two lines, one quiet line (sub-categories give way first), the tagline, the tone mark at the right. No photo, no note. */
export default function GroupRow({ group }: { group: GroupCardData }) {
    const t = useTranslations('discovery');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const topic = [group.category.l1Title, ...group.subCategories].join(' · ');

    return (
        <Link
            href={`/${group.category.l1Slug}/group/${group.slug}`}
            scroll={false}
            data-ui={UI.groupRow}
            style={{ ['--c' as string]: group.category.color }}
            className="flex min-h-14 items-center gap-2.5 border-t border-border py-2.5 first:border-t-0"
        >
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block font-heading text-[15px] font-semibold leading-snug text-foreground">{group.name}</span>
                <span className="mt-0.5 flex text-xs text-foreground-muted">
                    <span className="min-w-0 truncate">{topic}</span>
                    <span className="shrink-0 whitespace-pre"> · {cityLabel(tCities, group.city)} · {t('memberCount', { count: group.memberCount })}</span>
                </span>
                {group.tagline && <span lang={langAttr(group.taglineLang, locale)} className="mt-0.5 block truncate text-xs text-foreground-muted">{group.tagline}</span>}
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--c)_20%,var(--surface))] text-[var(--c)]">
                <CategoryIcon slug={group.category.l1Slug} aria-hidden="true" size={20} />
            </span>
        </Link>
    );
}
