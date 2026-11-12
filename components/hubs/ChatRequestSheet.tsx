'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MESSAGE_MAX_LENGTH } from '@/lib/validations/message';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

/**
 * The small compose form of a private request (K-83, K5-20): "Rakstīt privāti" under a Ziņa and "Rakstīt ziņu" on a Čats name card share it.
 * The caller owns the sending (`onSubmit`) and its `isPending`; the text stays until the caller closes the form.
 */
export default function ChatRequestSheet({ name, isPending, onSubmit, onCancel }: { name: string; isPending: boolean; onSubmit: (text: string) => void; onCancel: () => void }) {
    const t = useTranslations('hub.notes');
    const tCommon = useTranslations('common');
    const id = useId();
    const [text, setText] = useState('');
    return (
        <div className="grid w-full gap-2">
            <label htmlFor={`${id}-msg`} className="text-meta text-foreground-muted">{t('messageHint', { name })}</label>
            <Textarea id={`${id}-msg`} rows={3} value={text} maxLength={MESSAGE_MAX_LENGTH} placeholder={t('messagePlaceholder')} onChange={(e) => setText(e.target.value)} />
            <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={isPending || text.trim().length === 0} onClick={() => onSubmit(text)}>{t('send')}</Button>
                <Button size="sm" variant="quiet" disabled={isPending} onClick={onCancel}>{tCommon('cancel')}</Button>
            </div>
        </div>
    );
}
