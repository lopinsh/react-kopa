'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Button, { buttonClass } from '@/components/ui/Button';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import ErrorState from '@/components/ui/ErrorState';
import Sheet from '@/components/ui/Sheet';
import { LoadingRegion, SkeletonCard, SkeletonPanel, SkeletonRow } from '@/components/ui/Skeleton';
import Switch from '@/components/ui/Switch';
import TextCounter from '@/components/ui/TextCounter';
import { useToast, type ToastType } from '@/hooks/use-toast';

const TOAST_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'];
const SAMPLE_LIMIT = 200;

/** The switch, on and off, labelled by its row's text. */
export function SwitchDemo() {
    const t = useTranslations('admin.handbook.ui');
    const id = useId();
    const [on, setOn] = useState(true);
    const [off, setOff] = useState(false);
    return (
        <div className="grid max-w-xs gap-3">
            <div className="flex items-center justify-between gap-4"><span id={id + 'a'} className="text-body-sm text-foreground">{t('switchOn')}</span><Switch checked={on} onChange={setOn} labelledBy={id + 'a'} /></div>
            <div className="flex items-center justify-between gap-4"><span id={id + 'b'} className="text-body-sm text-foreground">{t('switchOff')}</span><Switch checked={off} onChange={setOff} labelledBy={id + 'b'} /></div>
        </div>
    );
}

/** The real toast: one at a time, so a second press replaces the first. */
export function ToastButtons() {
    const t = useTranslations('admin.handbook.ui');
    const { addToast } = useToast();
    return (
        <div className="flex flex-wrap gap-3">
            {TOAST_TYPES.map((type) => <Button key={type} variant="secondary" onClick={() => addToast(t(`toast.${type}`), type)}>{type}</Button>)}
        </div>
    );
}

export function SheetDemo() {
    const t = useTranslations('admin.handbook.ui');
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>{t('sample.sheetTitle')}</Button>
            {open && <Sheet title={t('sample.sheetTitle')} onClose={() => setOpen(false)}><p className="text-body-sm text-foreground-muted">{t('sample.sheetText')}</p></Sheet>}
        </>
    );
}

/** Both anchor modes: the pop-over's own button, and a menu's trigger (the confirmation opens at the trigger). */
export function PopoverDemo() {
    const t = useTranslations('admin.handbook.ui');
    const [ownOpen, setOwnOpen] = useState(false);
    const [anchoredOpen, setAnchoredOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const props = { message: t('sample.popoverMessage'), confirmLabel: t('sample.popoverConfirm'), destructive: true } as const;
    return (
        <div className="flex flex-wrap gap-3">
            <ConfirmPopover
                {...props}
                isOpen={ownOpen}
                onOpenChange={setOwnOpen}
                onConfirm={() => setOwnOpen(false)}
                renderTrigger={(trigger) => <button {...trigger} type="button" className={buttonClass('secondary')}>{t('sample.popoverConfirm')}</button>}
            />
            <button ref={anchorRef} type="button" className={buttonClass('secondary')} onClick={() => setAnchoredOpen(true)}>{t('sample.popoverConfirm')} (…)</button>
            <ConfirmPopover {...props} anchorRef={anchorRef} isOpen={anchoredOpen} onOpenChange={setAnchoredOpen} onConfirm={() => setAnchoredOpen(false)} />
        </div>
    );
}

export function ErrorStateDemo() {
    const t = useTranslations('admin.handbook.ui');
    const { success } = useToast();
    return <ErrorState onRetry={() => success(t('toast.success'))} />;
}

export function SkeletonDemo() {
    const label = useTranslations('common')('loading');
    return (
        <LoadingRegion label={label}>
            <div className="grid gap-4 sm:grid-cols-3">
                <SkeletonCard />
                <div className="sm:col-span-2"><SkeletonPanel /></div>
            </div>
            <div className="mt-2 max-w-md"><SkeletonRow /><SkeletonRow /></div>
        </LoadingRegion>
    );
}

/** A textarea with buttons that fill it to 50 %, 95 % and 101 % of a 200 limit: quiet, warning, over. */
export function CounterDemo() {
    const t = useTranslations('admin.handbook.ui');
    const id = useId();
    const [text, setText] = useState('');
    const fill = (percent: number) => setText('x'.repeat(Math.round((SAMPLE_LIMIT * percent) / 100)));
    return (
        <div className="max-w-md">
            <label htmlFor={id} className="mb-1 block text-button-sm text-foreground">{t('sample.counterLabel')}</label>
            <textarea id={id} rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-describedby={`${id}-count`} className="w-full resize-none rounded-xl line bg-surface p-3 text-body-sm" />
            <div className="mt-1 flex items-start gap-2"><TextCounter id={`${id}-count`} length={text.length} max={SAMPLE_LIMIT} /></div>
            <div className="mt-3 flex gap-2">{[50, 95, 101].map((p) => <Button key={p} size="sm" variant="secondary" onClick={() => fill(p)}>{p} %</Button>)}</div>
        </div>
    );
}
