import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { UiName } from '@/lib/constants';

type Props = {
    /** Key under `admin.handbook.ui.sections` for the title. */
    id: string;
    /** The `data-ui` name(s) the component carries (the ones feedback mode shows). */
    names: UiName[];
    /** Source file(s) of the real component(s), from the repository root. */
    files: string[];
    children: ReactNode;
    /** Frame style: `plain` sits on the page background, `bleed` has no padding (headers, bars). */
    padding?: 'plain' | 'bleed';
};

/** One block of the UI-elements page: title, the real component(s), and a caption naming the `data-ui` name and file path. */
export default function UiSpecimen({ id, names, files, children, padding = 'plain' }: Props) {
    const t = useTranslations('admin.handbook.ui');
    return (
        <section id={id} className="scroll-mt-24 space-y-3">
            <h2 className="text-lg font-black tracking-tight text-foreground">{t(`sections.${id}`)}</h2>
            <div className={clsx('overflow-hidden rounded-2xl border border-border bg-background', padding === 'plain' && 'p-4 sm:p-6')}>
                {children}
            </div>
            <p className="space-y-0.5 font-mono text-xs text-foreground-muted">
                <span className="block">
                    {t('names')}: {names.map((name) => <code key={name} className="mr-1.5 rounded bg-surface-elevated px-1.5 py-0.5 text-foreground">{name}</code>)}
                </span>
                {files.map((file) => <span key={file} className="block break-all">{t('file')}: {file}</span>)}
            </p>
        </section>
    );
}
