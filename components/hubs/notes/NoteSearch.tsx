'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/Input';

/** "Meklēt Ziņās" (K-98): `?q=` on the Ziņas page; Kur and the tab stay, an opened `?z=` goes. In the tab bar from 1024 px, under it below. */
export default function NoteSearch({ className }: { className?: string }) {
    const t = useTranslations('hub.notes');
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();
    const [value, setValue] = useState(search.get('q') ?? '');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const qs = new URLSearchParams(search.toString());
        qs.delete('z');
        qs.delete('compose');
        if (value.trim()) qs.set('q', value.trim());
        else qs.delete('q');
        const s = qs.toString().replace(/%2C/g, ',');
        router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    };

    return (
        <form role="search" onSubmit={submit} className={className}>
            <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                <Input type="search" value={value} onChange={(e) => setValue(e.target.value)} maxLength={100} aria-label={t('search')} placeholder={t('search')} className="pl-9" />
            </div>
        </form>
    );
}
