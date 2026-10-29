'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SettingSwitchRow from '@/components/me/SettingSwitchRow';
import { updateEmailSettings } from '@/actions/user-actions';

/** E-pasts: the one switch for the unread-things digest (R33). Disabled, with the reason, when the account has no mailable address. */
export default function EmailSettings({ initial, canEmail, demo = false }: { initial: boolean; canEmail: boolean; demo?: boolean }) {
    const t = useTranslations('profile.settings');
    const te = useTranslations('profile.settings.email');
    const [savedNote, setSavedNote] = useState(false);

    return (
        <fieldset id="email" className="scroll-mt-20 text-body-sm">
            <legend className="float-left mb-1.5 text-item">{te('title')}</legend>
            <div className="clear-both divide-y divide-border">
                <SettingSwitchRow
                    label={te('digest')}
                    description={canEmail ? te('digestDesc') : te('noEmail')}
                    checked={initial && canEmail}
                    onSave={(next) => updateEmailSettings({ emailNotifications: next })}
                    onSaved={() => setSavedNote(true)}
                    demo={demo}
                    disabled={!canEmail}
                />
            </div>
            <p role="status" aria-live="polite" className="sr-only">{savedNote ? t('saved') : ''}</p>
        </fieldset>
    );
}
