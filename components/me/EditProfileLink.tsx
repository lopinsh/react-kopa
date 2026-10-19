'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

/**
 * "Labot profilu" on the own bar: a word from 768 px, a 44 px icon below. Hidden on Mans profils (the view carries the button)
 * and on the edit page itself.
 */
export default function EditProfileLink() {
    const t = useTranslations('profile');
    const pathname = usePathname();
    if (pathname === '/profile' || pathname === '/profile/edit') return null;
    return (
        <Link
            href="/profile/edit"
            aria-label={t('editTitle')}
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-full text-foreground-muted hover:bg-tint hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:flex md:size-auto md:gap-1.5 md:px-3 md:py-1.5 md:text-sm md:font-semibold"
        >
            <Pencil aria-hidden className="size-4" />
            <span className="hidden md:inline">{t('editTitle')}</span>
        </Link>
    );
}
