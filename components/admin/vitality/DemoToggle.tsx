'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FilterChip from '@/components/ui/FilterChip';

/** "Include demo": flips `?demo=1` and keeps the other query params. */
export default function DemoToggle({ on }: { on: boolean }) {
    const t = useTranslations('admin.vitality');
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const [isPending, start] = useTransition();

    const flip = () => {
        if (isPending) return;
        const next = new URLSearchParams(params.toString());
        if (on) next.delete('demo');
        else next.set('demo', '1');
        const qs = next.toString();
        start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <FilterChip active={on} onClick={flip}>{t('demoShow')}</FilterChip>
            {!on && <p className="text-meta text-foreground-muted">{t('demoLeftOut')}</p>}
        </div>
    );
}
