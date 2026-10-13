'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { createPost } from '@/actions/post-actions';
import { announcementSchema, ANNOUNCEMENT_TITLE_MAX, ANNOUNCEMENT_MAX_LENGTH } from '@/lib/validations/announcement';
import Modal from '@/components/ui/Modal';

type Props = {
    groupId: string;
    locale: string;
    onClose: () => void;
    onPublished: () => void;
};

const FIELD = 'w-full rounded-2xl border border-border bg-surface-elevated p-4 text-sm outline-none transition-all placeholder:text-foreground-muted/50 focus:border-primary focus:ring-1 focus:ring-primary';

/** Pop-up where the owner or an admin writes a new announcement. Mounted only while open. */
export default function AnnouncementModal({ groupId, locale, onClose, onPublished }: Props) {
    const t = useTranslations('group');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const canSubmit = announcementSchema.safeParse({ title, content }).success && !isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        startTransition(async () => {
            const result = await createPost(groupId, { title, content }, locale);
            if (result.success) {
                onPublished();
            } else {
                setError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <Modal onClose={onClose} locked={isPending} variant="card" size="lg" accentLine title={t('announcementNew')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="announcement-title" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTitleLabel')}</label>
                    <input
                        id="announcement-title"
                        data-autofocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={ANNOUNCEMENT_TITLE_MAX}
                        className={FIELD}
                        placeholder={t('announcementTitlePlaceholder')}
                    />
                </div>
                <div>
                    <label htmlFor="announcement-content" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTextLabel')}</label>
                    <textarea
                        id="announcement-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={ANNOUNCEMENT_MAX_LENGTH}
                        rows={7}
                        className={`${FIELD} resize-none`}
                        placeholder={t('announcementPlaceholder')}
                    />
                </div>

                {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted transition-all hover:text-foreground disabled:opacity-50"
                    >
                        {tCommon('cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-background shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                {t('announcementPublish')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
