'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import FilterButton from './FilterButton';
import CategorySuggest from '@/components/discovery/CategorySuggest';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import CategoryList from '@/components/discovery/lists/CategoryList';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/** "Tēma": the category list as a drop-down (a bottom sheet on phones); a choice closes it. The chosen Tēma is the first chip at every width; without one the picker shows below 1024 only (the column has it from there). */
export default function TopicButton() {
    const t = useTranslations('discovery');
    const { categories } = useDiscovery();
    const { params, go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const [suggest, setSuggest] = useState<string | null>(null);
    const chosen = categories.find((c) => c.slug === params.category);
    const dot = chosen && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" />;

    return (
        <div ref={bindHost} className={clsx('relative shrink-0', !chosen && 'lg:hidden')}>
            <FilterButton
                icon={dot || <LayoutGrid aria-hidden="true" className="size-3 shrink-0" />}
                label={chosen?.title ?? t('topic')}
                ariaLabel={chosen ? t('topicLabel', { topic: chosen.title }) : t('topic')}
                chosen={!!chosen}
                open={pop.open}
                onToggle={pop.toggle}
                controls={pop.id}
                onClear={() => go({ category: null, tags: [] })}
                clearLabel={t('clearChoice', { what: chosen?.title ?? '' })}
                widthClass="max-w-64"
                tone={chosen?.color}
            />
            <FilterPopover pop={pop} title={t('topic')} onClose={() => pop.setOpen(false)}>
                <CategoryList onChoose={() => pop.setOpen(false)} onSuggest={setSuggest} autoFocus={pop.desktop} />
            </FilterPopover>
            {suggest !== null && <CategorySuggest word={suggest} onClose={() => setSuggest(null)} />}
        </div>
    );
}
