'use client';

import { useId, useState, useTransition, type FormEvent, type RefObject } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { joinGroup, sendInquiry } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';
import { MESSAGE_MAX_LENGTH, messageTextSchema } from '@/lib/validations/message';
import { isOverLimit } from '@/lib/text-limit';
import { UI } from '@/lib/constants';
import Button, { buttonClass } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import TextCounter from '@/components/ui/TextCounter';
import { OverlayCloseButton } from '@/components/ui/overlay-support';

type Props = {
    groupId: string;
    groupName: string;
    /** The group takes new members: show the "I'd like to join" switch (on by default). */
    allowJoin: boolean;
    onClose: () => void;
    /** Where focus goes on close when the opener is gone (a menu item). */
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * The one form for writing to a group's team (AR-45). With the switch on it also files the join request; the group page behind
 * follows through the layout revalidation. The caller mounts it only while open, so each opening starts empty.
 * It takes the group as props (not from the group context) because the discovery panel (R6) opens it outside any group page.
 */
export default function ContactForm({ groupId, groupName, allowJoin, onClose, returnFocusRef }: Props) {
    const t = useTranslations('contactForm');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { success } = useToast();
    const id = useId();
    const [message, setMessage] = useState('');
    const [wantsToJoin, setWantsToJoin] = useState(allowJoin);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const joining = allowJoin && wantsToJoin;
    const canSubmit = messageTextSchema.safeParse(message).success && !isOverLimit(message, MESSAGE_MAX_LENGTH) && !isPending;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError(null);
        startTransition(async () => {
            const result = joining
                ? await joinGroup(groupId, locale, message)
                : await sendInquiry(groupId, message);
            if (result.success) {
                onClose();
                success(t('sentToast'));
            } else {
                setError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <Modal
            onClose={onClose}
            returnFocusRef={returnFocusRef}
            locked={isPending}
            dirty={message.trim() !== ''}
            title={joining ? t('titleJoin', { name: groupName }) : t('title', { name: groupName })}
        >
            <form onSubmit={handleSubmit} data-ui={UI.contactDialog} className="space-y-4">
                <p className="text-body-sm text-foreground-muted">{joining ? t('descriptionJoin') : t('description')}</p>
                <div>
                    <label htmlFor={`${id}-message`} className="sr-only">{t('messageLabel')}</label>
                    <textarea
                        id={`${id}-message`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-describedby={`${id}-count`}
                        rows={5}
                        placeholder={t('placeholder')}
                        className="w-full resize-none rounded-xl line bg-surface p-3.5 text-body-sm outline-none placeholder:text-foreground-muted/60 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <div className="mt-1 flex"><TextCounter id={`${id}-count`} length={message.length} max={MESSAGE_MAX_LENGTH} /></div>
                </div>

                {allowJoin && (
                    <div className="flex items-center justify-between gap-4">
                        <span id={`${id}-join`} className="text-body-sm text-foreground">{t('joinSwitch')}</span>
                        <Switch checked={wantsToJoin} onChange={setWantsToJoin} labelledBy={`${id}-join`} disabled={isPending} />
                    </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                    <OverlayCloseButton disabled={isPending} className={buttonClass('secondary')}>{tCommon('cancel')}</OverlayCloseButton>
                    <Button type="submit" disabled={!canSubmit}>
                        {isPending ? <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
                        {t('send')}
                    </Button>
                </div>
                {error && <p role="alert" className="text-right text-body-sm text-danger">{error}</p>}
            </form>
        </Modal>
    );
}
