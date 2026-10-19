'use client';

import { useTranslations } from 'next-intl';
import { DESIGN_PARTS, UI, type DesignPart } from '@/lib/constants';

type Props = { part: DesignPart; blockedParts: DesignPart[]; onSelect: (part: DesignPart) => void };

/** The three parts of Dizains as underline sub-tabs (AR-21). The link works without JS; with JS the draft stays in place. */
export default function DesignPartTabs({ part, blockedParts, onSelect }: Props) {
    const t = useTranslations('admin.design');
    return (
        <nav aria-label={t('parts.label')} data-ui={UI.tabs} className="sticky top-0 z-10 mb-6 flex gap-[18px] overflow-x-auto border-b border-border bg-background text-sm text-foreground-muted scrollbar-none">
            {DESIGN_PARTS.map((p) => {
                const on = p === part;
                return (
                    <a
                        key={p}
                        href={`?part=${p}`}
                        aria-current={on ? 'page' : undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelect(p);
                            window.history.replaceState(null, '', `?part=${p}`);
                        }}
                        className={`-mb-px inline-flex min-h-11 items-end gap-1.5 whitespace-nowrap border-b-2 pb-2 pt-1 hover:text-foreground ${on ? 'border-primary font-semibold text-foreground' : 'border-transparent'}`}
                    >
                        {t(`parts.${p}`)}
                        {blockedParts.includes(p) && (
                            <>
                                <span aria-hidden="true" className="mb-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
                                <span className="sr-only">{t('contrast.partHasIssues')}</span>
                            </>
                        )}
                    </a>
                );
            })}
        </nav>
    );
}
