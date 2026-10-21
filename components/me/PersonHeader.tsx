'use client';

import { useMeContext } from '@/components/providers/MeProvider';
import { UI } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import EditProfileLink from './EditProfileLink';

/** The head of the own area on desktop: your picture, name and "city · groups" (AR-60). */
export default function PersonHeader() {
    const t = useTranslations('profile.area');
    const { name, avatarSrc, line } = useMeContext();
    return (
        <div data-ui={UI.personHeader} className="hidden border-b border-border bg-surface md:block">
            <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-3 px-6">
            <Link href="/profile" aria-label={`${name}, ${t('viewProfile')}`} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <img src={avatarSrc} alt="" className="size-12 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <p className="truncate text-item">{name}</p>
                    {line && <p className="truncate text-meta text-foreground-muted">{line}</p>}
                </div>
            </Link>
            <EditProfileLink />
            </div>
        </div>
    );
}
