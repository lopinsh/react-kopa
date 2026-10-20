'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { discoveryHref, type DiscoveryKind } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';

const KINDS: DiscoveryKind[] = ['groups', 'events'];

/** Grupas | Pasākumi: two links in a tray, the current half raised. Keeps the place, Tēma, Veidi and word. */
export default function ViewSwitch({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const { params } = useDiscoveryNav();
    return (
        <nav aria-label={t('viewLabel')} data-ui={UI.viewSwitch} className={clsx('flex h-8 shrink-0 rounded-pill bg-tint p-0.5', className)}>
            {KINDS.map((kind) => (
                <Link
                    key={kind}
                    href={discoveryHref(params, { kind, limit: undefined })}
                    scroll={false}
                    aria-current={params.kind === kind ? 'page' : undefined}
                    className={clsx(
                        'relative flex flex-1 items-center justify-center rounded-pill px-3.5 text-[13px] after:absolute after:-inset-y-1.5 after:inset-x-0 md:flex-none',
                        params.kind === kind ? 'bg-surface font-semibold text-foreground shadow-sm' : 'font-medium text-foreground-muted hover:text-foreground'
                    )}
                >
                    {t(kind)}
                </Link>
            ))}
        </nav>
    );
}
