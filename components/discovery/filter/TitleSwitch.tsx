'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { discoveryHref, type DiscoveryKind } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';

const KINDS: DiscoveryKind[] = ['groups', 'events'];

/** The board's title is the switch (AR-26): "Grupas 27 | Pasākumi 5", the current word strong with a short accent underline like a tab, the other muted, each with its count. Keeps the place, Tēma, Veidi and word. */
export default function TitleSwitch({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const { params } = useDiscoveryNav();
    const { kindTotals } = useDiscovery();
    return (
        <nav aria-label={t('viewLabel')} data-ui={UI.viewSwitch} className={clsx('flex h-10 items-end gap-5 whitespace-nowrap', className)}>
            {KINDS.map((kind) => {
                const count = kindTotals[kind];
                return (
                    <span key={kind} className="contents">
                        <Link
                            href={discoveryHref(params, { kind, limit: undefined })}
                            scroll={false}
                            aria-current={params.kind === kind ? 'page' : undefined}
                            aria-label={kind === 'groups' ? t('groupsTab', { count }) : t('eventsTab', { count })}
                            className={clsx(
                                'relative pb-2 text-title transition-colors duration-quick',
                                params.kind === kind
                                    ? 'weight-strong text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-6 after:bg-primary'
                                    : 'text-foreground-muted hover:text-foreground'
                            )}
                        >
                            {t(kind)}
                            <span aria-hidden="true" className="ml-1.5 text-meta weight-medium tabular-nums text-foreground-muted">{count}</span>
                        </Link>
                    </span>
                );
            })}
        </nav>
    );
}
