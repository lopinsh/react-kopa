'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link, usePathname } from '@/i18n/routing';
import { getFeedbackPages } from '@/actions/feedback-actions';
import FeedbackMode from '@/components/feedback/FeedbackMode';
import FeedbackNotesPanel from '@/components/feedback/FeedbackNotesPanel';
import Switch from '@/components/ui/Switch';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import { PANEL_OTHER_PAGES_MAX } from '@/lib/constants';
import type { PanelTabProps } from './PanelTabBody';

type PageCount = { path: string; count: number };

/** Atsauksmes: the feedback layer on the page, "Komentēt jebkur", this page's notes and the open notes on other pages. */
export default function FeedbackTab({ paused }: PanelTabProps) {
    const t = useTranslations('admin.panel.feedback');
    const tMode = useTranslations('feedbackMode');
    const pathname = usePathname();
    // Default: notes go on named components. "Comment anywhere" is the fallback for anything without a name.
    const [anywhere, setAnywhere] = useState(false);
    const [pages, setPages] = useState<PageCount[]>([]);

    useEffect(() => {
        let cancelled = false;
        getFeedbackPages().then((res) => {
            if (!cancelled) setPages(res.success ? res.data ?? [] : []);
        });
        return () => { cancelled = true; };
    }, [pathname]);

    const others = pages.filter((p) => p.path !== pathname);
    const othersTotal = others.reduce((sum, p) => sum + p.count, 0);

    return (
        <FeedbackMode paused={paused} anywhere={anywhere}>
            {({ notes, missing, onOpen }) => (
                <>
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span id="admin-panel-anywhere" className="min-w-0 flex-1 text-body-sm text-foreground">{tMode('anywhere')}</span>
                            <Switch checked={anywhere} onChange={setAnywhere} labelledBy="admin-panel-anywhere" />
                        </div>
                        <section aria-labelledby="admin-panel-this-page" className="space-y-1">
                            <h3 id="admin-panel-this-page" className="text-meta text-foreground-muted">{t('thisPage', { count: notes.length })}</h3>
                            <FeedbackNotesPanel notes={notes} missing={missing} onOpen={onOpen} />
                        </section>
                        <section aria-labelledby="admin-panel-other-pages" className="space-y-1">
                            <h3 id="admin-panel-other-pages" className="text-meta text-foreground-muted">{t('otherPages', { count: othersTotal })}</h3>
                            {others.length === 0 ? (
                                <p className="px-2 py-1 text-body-sm text-foreground-muted">{t('noOther')}</p>
                            ) : (
                                <ul>
                                    {others.slice(0, PANEL_OTHER_PAGES_MAX).map((p) => (
                                        <li key={p.path}>
                                            <Link href={p.path} className={clsx('flex items-baseline justify-between gap-3 rounded-xl px-2 py-1 text-meta hover:bg-surface-elevated')}>
                                                <span className="min-w-0 break-all text-foreground">{p.path}</span>
                                                <span className="shrink-0 text-foreground-muted">{p.count}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {others.length > PANEL_OTHER_PAGES_MAX && (
                                <Link href="/admin/feedback" className={clsx(TEXT_LINK_CLASS, 'px-2')}>{t('all')}</Link>
                            )}
                        </section>
                    </div>
                    <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-meta text-foreground-muted">
                        <span>{t('onThisPage', { count: notes.length })}</span>
                        <Link href="/admin/feedback" className={TEXT_LINK_CLASS}>{t('all')}</Link>
                    </footer>
                </>
            )}
        </FeedbackMode>
    );
}
