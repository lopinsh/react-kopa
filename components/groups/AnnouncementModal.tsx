'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { createPost } from '@/actions/post-actions';
import { announcementSchema, ANNOUNCEMENT_TITLE_MAX, ANNOUNCEMENT_MAX_LENGTH } from '@/lib/validations/announcement';
import Modal from '@/components/ui/Modal';
import { OverlayCloseButton } from '@/components/ui/overlay-support';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';

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

    const over = isOverLimit(title, ANNOUNCEMENT_TITLE_MAX) || isOverLimit(content, ANNOUNCEMENT_MAX_LENGTH);
    const canSubmit = announcementSchema.safeParse({ title, content }).success && !isPending && !over;

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
        <Modal onClose={onClose} locked={isPending} dirty={title !== '' || content !== ''} size="lg" title={t('announcementNew')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="announcement-title" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTitleLabel')}</label>
                    <input
                        id="announcement-title"
                        data-autofocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        aria-describedby="announcement-title-count"
                        className={FIELD}
                        placeholder={t('announcementTitlePlaceholder')}
                    />
                    <div className="mt-1 flex items-start gap-2"><TextCounter id="announcement-title-count" length={title.length} max={ANNOUNCEMENT_TITLE_MAX} /></div>
                </div>
                <div>
                    <label htmlFor="announcement-content" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTextLabel')}</label>
                    <textarea
                        id="announcement-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        aria-describedby="announcement-content-count"
                        rows={7}
                        className={`${FIELD} resize-none`}
                        placeholder={t('announcementPlaceholder')}
                    />
                    <div className="mt-1 flex items-start gap-2"><TextCounter id="announcement-content-count" length={content.length} max={ANNOUNCEMENT_MAX_LENGTH} /></div>
                </div>

                {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <OverlayCloseButton
                        disabled={isPending}
                        className="rounded-xl px-5 py-3 text-[11px] font-semibold text-foreground-muted transition-all hover:text-foreground disabled:opacity-50"
                    >
                        {tCommon('cancel')}
                    </OverlayCloseButton>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[11px] font-semibold text-background shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
