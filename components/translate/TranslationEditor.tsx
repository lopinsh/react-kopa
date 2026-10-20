'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import { OverlayCloseButton } from '@/components/ui/overlay-support';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { getTranslationEntry, suggestTranslation } from '@/actions/translation-actions';
import { useToast } from '@/hooks/use-toast';
import type { TranslationEntry } from '@/lib/services/message-override.service';
import { MESSAGE_LANGS, type MessageLang } from '@/lib/translate-mode/messages';
import { validateMessage, MESSAGE_OVERRIDE_MAX, type MessageIssue } from '@/lib/validations/message-override';

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
                setValues({ lv: res.data.pending.lv ?? res.data.lv, en: res.data.pending.en ?? res.data.en });
            } else {
                setLoadError(res.success ? 'ACTION_FAILED' : res.error);
            }
        });
        return () => { cancelled = true; };
    }, [messageKey]);

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
    const over = isOverLimit(values.lv, MESSAGE_OVERRIDE_MAX) || isOverLimit(values.en, MESSAGE_OVERRIDE_MAX);
    const isEmpty = values.lv.trim() === '' || values.en.trim() === '';

    const errorText = (code: string) => (tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const handleSave = () => {
        if (isPending || !entry || hasIssue || isEmpty || over) return;
        setSaveError(null);
        startTransition(async () => {
            const res = await suggestTranslation({ key: entry.key, lv: values.lv, en: values.en });
            if (res.success) {
                toastSuccess(t('suggested'));
                router.refresh();
                onClose();
            } else {
                setSaveError(errorText(res.error));
                toastError(errorText(res.error));
            }
        });
    };

    return (
        <Modal
            onClose={onClose}
            locked={isPending}
            dirty={!!entry && (values.lv !== (entry.pending.lv ?? entry.lv) || values.en !== (entry.pending.en ?? entry.en))}
            size="4xl"
            translateIgnore
            zIndexClassName="z-[70]"
            panelClassName="flex max-h-[90vh] flex-col"
            title={t('editTitle')}
            subtitle={
                <p className="mt-1 break-all font-mono text-meta text-foreground-muted">
                    <span className="font-sans weight-strong">{t('keyLabel')}: </span>{messageKey}
                </p>
            }
        >
            {loadError ? (
                <p className="text-body-sm text-danger">{errorText(loadError)}</p>
            ) : !entry ? (
                <p className="text-body-sm text-foreground-muted">{t('loading')}</p>
            ) : (
                <>
                    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto sm:grid-cols-2">
                        {MESSAGE_LANGS.map((lang) => {
                            const issue = issues[lang];
                            return (
                                <div key={lang} className="flex flex-col">
                                    <label htmlFor={`tm-${lang}`} className="mb-1 flex items-center gap-2 text-button-sm text-foreground">
                                        {t(LANG_LABEL[lang])}
                                        {entry.edited[lang] && (
                                            <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-tag text-primary">{t('edited')}</span>
                                        )}
                                        {entry.pending[lang] !== null && (
                                            <span className="rounded-pill bg-warning/10 px-2 py-0.5 text-tag text-warning">{t('waiting')}</span>
                                        )}
                                    </label>
                                    <textarea
                                        id={`tm-${lang}`}
                                        lang={lang}
                                        value={values[lang]}
                                        onChange={(e) => setValues((v) => ({ ...v, [lang]: e.target.value }))}
                                        rows={6}
                                        aria-describedby={`tm-count-${lang}`}
                                        aria-invalid={!!issue}
                                        className={clsx(
                                            'w-full flex-1 resize-y rounded-xl border bg-surface-elevated px-4 py-3 font-mono text-body-sm text-foreground outline-none focus:border-primary/50',
                                            issue ? 'border-danger/40' : 'border-border'
                                        )}
                                    />
                                    <div className="mt-1 flex items-start gap-2">
                                        {issue && <p role="alert" className="text-meta text-danger">{describe(issue)}</p>}
                                        <TextCounter id={`tm-count-${lang}`} length={values[lang].length} max={MESSAGE_OVERRIDE_MAX} />
                                    </div>
                                    {entry.pending[lang] !== null && (
                                        <p className="mt-1 text-meta text-foreground-muted">
                                            {t('live')}: <span className="font-mono">{entry[lang]}</span>
                                        </p>
                                    )}
                                    {entry.edited[lang] && (
                                        <p className="mt-1 text-meta text-foreground-muted">
                                            {t('original')}: <span className="font-mono">{entry.source[lang]}</span>
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-3 text-meta text-foreground-muted">{t('suggestHint')}</p>
                    <p className="mt-1 text-meta text-foreground-muted">{t('syntaxHint')}</p>
                    {saveError && <p role="alert" className="mt-2 text-body-sm text-danger">{saveError}</p>}
                    <div className="mt-4 flex justify-end gap-3">
                        <OverlayCloseButton disabled={isPending} className="rounded-xl px-5 py-2.5 text-body-sm text-foreground-muted transition-all hover:bg-surface-elevated disabled:opacity-50">
                            {t('cancel')}
                        </OverlayCloseButton>
                        <button type="button" onClick={handleSave} disabled={isPending || hasIssue || isEmpty || over} className="rounded-pill bg-primary px-5 py-2.5 text-button-sm text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50">
                            {isPending ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : t('suggest')}
                        </button>
                    </div>
                </>
            )}
        </Modal>
    );
}
