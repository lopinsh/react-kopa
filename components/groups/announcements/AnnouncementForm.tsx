'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe, Lock, Plus, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { createPost } from '@/actions/post-actions';
import { announcementSchema, ANNOUNCEMENT_TITLE_MAX, ANNOUNCEMENT_MAX_LENGTH } from '@/lib/validations/announcement';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { OverlayCloseButton } from '@/components/ui/overlay-support';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';

type Visibility = 'PUBLIC' | 'MEMBERS_ONLY';
type Props = { groupId: string; locale: string; /** The choice is offered in public groups only. */ canChooseVisibility: boolean };

const FIELD = 'w-full rounded-2xl border border-border bg-surface-elevated p-4 text-sm outline-none transition-all placeholder:text-foreground-muted/50 focus:border-primary focus:ring-1 focus:ring-primary';

/** "Jauns ieraksts": the button for the team and, once pressed, the pop-up where the post is written. */
export default function AnnouncementForm({ groupId, locale, canChooseVisibility }: Props) {
    const t = useTranslations('group');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<Visibility>(canChooseVisibility ? 'PUBLIC' : 'MEMBERS_ONLY');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const over = isOverLimit(title, ANNOUNCEMENT_TITLE_MAX) || isOverLimit(content, ANNOUNCEMENT_MAX_LENGTH);
    const canSubmit = announcementSchema.safeParse({ title, content, visibility }).success && !isPending && !over;

    const close = () => { setIsOpen(false); setTitle(''); setContent(''); setError(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        startTransition(async () => {
            const result = await createPost(groupId, { title, content, visibility }, locale);
            if (result.success) {
                close();
                router.refresh();
            } else {
                setError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <>
            <Button size="sm" onClick={() => setIsOpen(true)}><Plus aria-hidden />{t('announcementNew')}</Button>
            {isOpen && (
                <Modal onClose={close} locked={isPending} dirty={title !== '' || content !== ''} size="lg" title={t('announcementNew')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="announcement-title" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTitleLabel')}</label>
                            <input id="announcement-title" data-autofocus value={title} onChange={(e) => setTitle(e.target.value)} aria-describedby="announcement-title-count" className={FIELD} placeholder={t('announcementTitlePlaceholder')} />
                            <div className="mt-1 flex items-start gap-2"><TextCounter id="announcement-title-count" length={title.length} max={ANNOUNCEMENT_TITLE_MAX} /></div>
                        </div>
                        <div>
                            <label htmlFor="announcement-content" className="mb-1.5 block text-xs font-bold text-foreground">{t('announcementTextLabel')}</label>
                            <textarea id="announcement-content" value={content} onChange={(e) => setContent(e.target.value)} aria-describedby="announcement-content-count" rows={7} className={`${FIELD} resize-none`} placeholder={t('announcementPlaceholder')} />
                            <div className="mt-1 flex items-start gap-2"><TextCounter id="announcement-content-count" length={content.length} max={ANNOUNCEMENT_MAX_LENGTH} /></div>
                        </div>
                        {canChooseVisibility && (
                            <fieldset>
                                <legend className="mb-1.5 text-xs font-bold text-foreground">{t('announcementVisibility')}</legend>
                                <div role="radiogroup" className="flex gap-2">
                                    {(['PUBLIC', 'MEMBERS_ONLY'] as const).map((v) => {
                                        const Icon = v === 'PUBLIC' ? Globe : Lock;
                                        return (
                                            <button
                                                key={v}
                                                type="button"
                                                role="radio"
                                                aria-checked={visibility === v}
                                                onClick={() => setVisibility(v)}
                                                className={clsx(
                                                    'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                                                    visibility === v ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-foreground-muted hover:bg-surface-elevated'
                                                )}
                                            >
                                                <Icon aria-hidden className="size-3.5" />
                                                {v === 'PUBLIC' ? t('announcementVisibilityPublic') : t('announcementVisibilityMembers')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <OverlayCloseButton disabled={isPending} className="rounded-xl px-5 py-3 text-[11px] font-semibold text-foreground-muted transition-all hover:text-foreground disabled:opacity-50">{tCommon('cancel')}</OverlayCloseButton>
                            <Button type="submit" disabled={!canSubmit}>
                                {isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <><Send aria-hidden />{t('announcementPublish')}</>}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
