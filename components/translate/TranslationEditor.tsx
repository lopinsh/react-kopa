'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { getTranslationEntry, saveTranslation } from '@/actions/translation-actions';
import { useToast } from '@/hooks/use-toast';
import type { TranslationEntry } from '@/lib/services/message-override.service';
import { MESSAGE_LANGS, type MessageLang } from '@/lib/translate-mode/messages';
import { validateMessage, type MessageIssue } from '@/lib/validations/message-override';

type Props = {
    messageKey: string;
    onClose: () => void;
};

const LANG_LABEL: Record<MessageLang, 'langLv' | 'langEn'> = { lv: 'langLv', en: 'langEn' };

/** Pop-up with the key and both languages side by side. Validates like the server before saving. */
export default function TranslationEditor({ messageKey, onClose }: Props) {
    const t = useTranslations('translateMode');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [entry, setEntry] = useState<TranslationEntry | null>(null);
    const [values, setValues] = useState<Record<MessageLang, string>>({ lv: '', en: '' });
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getTranslationEntry(messageKey).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) {
                setEntry(res.data);
                setValues({ lv: res.data.lv, en: res.data.en });
            } else {
                setLoadError(res.success ? 'ACTION_FAILED' : res.error);
            }
        });
        return () => { cancelled = true; };
    }, [messageKey]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const describe = (issue: MessageIssue): string => {
        if (issue.code === 'ICU_SYNTAX') return t('issueSyntax');
        if (issue.code === 'PLACEHOLDER_MISMATCH') return t('issuePlaceholder', { detail: issue.detail });
        return t('issueArm', { detail: issue.detail });
    };

    const issues: Record<MessageLang, MessageIssue | null> = {
        lv: entry ? validateMessage(values.lv, entry.source.lv || undefined) : null,
        en: entry ? validateMessage(values.en, entry.source.en || undefined) : null,
    };
    const hasIssue = !!issues.lv || !!issues.en;
    const isEmpty = values.lv.trim() === '' || values.en.trim() === '';

    const errorText = (code: string) => (tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const handleSave = () => {
        if (isPending || !entry || hasIssue || isEmpty) return;
        setSaveError(null);
        startTransition(async () => {
            const res = await saveTranslation({ key: entry.key, lv: values.lv, en: values.en });
            if (res.success) {
                toastSuccess(t('saved'));
                router.refresh();
                onClose();
            } else {
                setSaveError(errorText(res.error));
                toastError(errorText(res.error));
            }
        });
    };

    return (
        <div
            data-translate-ignore
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div role="dialog" aria-modal="true" aria-label={t('editTitle')} className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-surface p-5 shadow-2xl sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-foreground">{t('editTitle')}</h2>
                        <p className="mt-1 break-all font-mono text-xs text-foreground-muted">
                            <span className="font-sans font-semibold">{t('keyLabel')}: </span>{messageKey}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t('cancel')} className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface-elevated">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loadError ? (
                    <p className="text-sm font-medium text-red-500">{errorText(loadError)}</p>
                ) : !entry ? (
                    <p className="text-sm text-foreground-muted">{t('loading')}</p>
                ) : (
                    <>
                        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto sm:grid-cols-2">
                            {MESSAGE_LANGS.map((lang) => {
                                const issue = issues[lang];
                                return (
                                    <div key={lang} className="flex flex-col">
                                        <label htmlFor={`tm-${lang}`} className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            {t(LANG_LABEL[lang])}
                                            {entry.edited[lang] && (
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{t('edited')}</span>
                                            )}
                                        </label>
                                        <textarea
                                            id={`tm-${lang}`}
                                            lang={lang}
                                            value={values[lang]}
                                            onChange={(e) => setValues((v) => ({ ...v, [lang]: e.target.value }))}
                                            rows={6}
                                            maxLength={2000}
                                            aria-invalid={!!issue}
                                            className={clsx(
                                                'w-full flex-1 resize-y rounded-xl border bg-surface-elevated px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-primary/50',
                                                issue ? 'border-red-500/60' : 'border-border'
                                            )}
                                        />
                                        {issue && <p role="alert" className="mt-1 text-xs font-medium text-red-500">{describe(issue)}</p>}
                                        {entry.edited[lang] && (
                                            <p className="mt-1 text-xs text-foreground-muted">
                                                {t('original')}: <span className="font-mono">{entry.source[lang]}</span>
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs text-foreground-muted">{t('syntaxHint')}</p>
                        {saveError && <p role="alert" className="mt-2 text-sm font-medium text-red-500">{saveError}</p>}
                        <div className="mt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={isPending} className="rounded-xl px-5 py-2.5 text-sm font-bold text-foreground-muted transition-all hover:bg-surface-elevated disabled:opacity-50">
                                {t('cancel')}
                            </button>
                            <button type="button" onClick={handleSave} disabled={isPending || hasIssue || isEmpty} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50">
                                {isPending ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : t('save')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
