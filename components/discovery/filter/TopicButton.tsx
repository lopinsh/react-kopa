'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid } from 'lucide-react';
import FilterButton from './FilterButton';
import CategorySuggest from '@/components/discovery/CategorySuggest';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import CategoryList from '@/components/discovery/lists/CategoryList';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/** "Tēma": the category list as a drop-down (sheet on phones); a choice closes it. Shows the same choice as the drawer. */
export default function TopicButton() {
    const t = useTranslations('discovery');
    const { categories } = useDiscovery();
    const { params, go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const [suggest, setSuggest] = useState<string | null>(null);
    const chosen = categories.find((c) => c.slug === params.category);
    const dot = chosen && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" style={{ ['--c' as string]: chosen.color }} />;

    return (
        <div ref={bindHost} className="relative min-w-0 shrink">
            <FilterButton
                icon={dot || <LayoutGrid aria-hidden="true" className="size-3.5 shrink-0" />}
                label={chosen?.title ?? t('topic')}
                ariaLabel={chosen ? t('topicLabel', { topic: chosen.title }) : t('topic')}
                chosen={!!chosen}
                open={pop.open}
                onToggle={pop.toggle}
                controls={pop.id}
                onClear={() => go({ category: null, tags: [] })}
                clearLabel={t('clearChoice', { what: chosen?.title ?? '' })}
                widthClass="max-w-[11rem]"
            />
            <FilterPopover pop={pop} title={t('topic')} onClose={() => pop.setOpen(false)}>
                <CategoryList onChoose={() => pop.setOpen(false)} onSuggest={setSuggest} autoFocus={pop.desktop} />
            </FilterPopover>
            {suggest !== null && <CategorySuggest word={suggest} onClose={() => setSuggest(null)} />}
        </div>
    );
}
