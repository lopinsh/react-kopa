'use client';

import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { PanelRight, PanelRightClose, Pause, Play, X } from 'lucide-react';
import { clsx } from 'clsx';
import { IconButton, buttonClass } from '@/components/ui/Button';

type Props = {
    /** Phone sheet: a handle instead of a drag bar and no dock button. */
    phone: boolean;
    docked: boolean;
    showPause: boolean;
    paused: boolean;
    onPause: () => void;
    onDockToggle: () => void;
    onClose: () => void;
    /** Pointer handlers: drag the panel (768+) or resize the sheet (phone, on the handle). */
    dragProps: Pick<ComponentProps<'div'>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
    handleProps: ComponentProps<'button'>;
};

/** Handle (phone) or drag bar (768+), title, Pauze, dock and close. */
export default function PanelTopBar({ phone, docked, showPause, paused, onPause, onDockToggle, onClose, dragProps, handleProps }: Props) {
    const t = useTranslations('admin.panel');

    return (
        <div>
            {phone && (
                <button type="button" aria-label={t('resize')} className="flex h-11 w-full touch-none items-center justify-center outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary" {...handleProps}>
                    <span aria-hidden className="h-1 w-10 rounded-pill bg-border" />
                </button>
            )}
            <div
                {...(phone ? {} : dragProps)}
                className={clsx('flex min-h-11 items-center gap-1 px-3', !phone && 'touch-none select-none', !phone && (docked ? 'cursor-grab' : 'cursor-move'))}
            >
                <h2 className="min-w-0 flex-1 truncate text-item text-foreground">{t('label')}</h2>
                {showPause && (
                    <button
                        type="button"
                        onClick={onPause}
                        aria-pressed={paused}
                        className={buttonClass(paused ? 'primary' : 'quiet', 'gap-1', 'sm')}
                    >
                        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                        <span>{paused ? t('paused') : t('pause')}</span>
                    </button>
                )}
                {!phone && (
                    <IconButton aria-label={docked ? t('undock') : t('dock')} onClick={onDockToggle}>
                        {docked ? <PanelRightClose aria-hidden className="size-4" /> : <PanelRight aria-hidden className="size-4" />}
                    </IconButton>
                )}
                <IconButton aria-label={t('close')} onClick={onClose}>
                    <X aria-hidden className="size-4" />
                </IconButton>
            </div>
        </div>
    );
}
