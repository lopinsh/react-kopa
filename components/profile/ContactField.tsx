'use client';

import { useTranslations } from 'next-intl';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import TextCounter from '@/components/ui/TextCounter';
import TextLink from '@/components/ui/TextLink';
import { USER_CONTACT_MAX } from '@/lib/validations/user';

type Props = { register: UseFormRegisterReturn; length: number; error?: string; isPublic: boolean };

/** Labot profilu: the contact line, its counter and a hint on who sees it (R32). */
export default function ContactField({ register, length, error, isPublic }: Props) {
    const t = useTranslations('profile.edit');
    const tv = useTranslations('profile.edit.validation');
    return (
        <div className="space-y-2">
            <label htmlFor="contact" className="block text-button-sm text-foreground">{t('contact')}</label>
            <Input id="contact" {...register} autoComplete="off" placeholder={t('contactPlaceholder')} aria-describedby="contact-count contact-hint" />
            <div className="flex items-start gap-2">
                {error ? <p className="text-meta text-danger">{tv(error as 'CONTACT_TOO_LONG')}</p> : null}
                <TextCounter id="contact-count" length={length} max={USER_CONTACT_MAX} />
            </div>
            <p id="contact-hint" className="text-meta text-foreground-muted">
                {isPublic
                    ? <>{t('contactHint')} <TextLink href="/settings#privacy">{t('contactPrivacyLink')}</TextLink>.</>
                    : t('contactPrivate')}
            </p>
        </div>
    );
}
