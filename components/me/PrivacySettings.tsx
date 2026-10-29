'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SettingSwitchRow from '@/components/me/SettingSwitchRow';
import { updatePrivacy } from '@/actions/user-actions';
import type { PrivacySettings as Privacy } from '@/lib/types/profile';

const ROWS = [
    { key: 'isProfilePublic', label: 'publicProfile' },
    { key: 'allowDirectMessages', label: 'allowMessages' },
    { key: 'showGroupsOnProfile', label: 'showGroups' },
    { key: 'contactVisibleToAll', label: 'contactAll' },
] as const;

/** Privātums: who can open your profile, message you and see your groups. Each switch saves when you change it (OD-26).
 * `demo` (the handbook UI elements page) flips the switches without saving. */
export default function PrivacySettings({ initial, demo = false }: { initial: Privacy; demo?: boolean }) {
    const t = useTranslations('profile.settings');
    const tp = useTranslations('profile.settings.privacy');
    const [savedNote, setSavedNote] = useState(false);

    return (
        <fieldset id="privacy" className="scroll-mt-20 text-body-sm">
            <legend className="float-left mb-1.5 text-item">{t('privacy.title')}</legend>
            <div className="clear-both divide-y divide-border">
                {ROWS.map(({ key, label }) => (
                    <SettingSwitchRow
                        key={key}
                        label={tp(label)}
                        description={tp(`${label}Desc`)}
                        checked={initial[key]}
                        onSave={(next) => updatePrivacy({ [key]: next })}
                        onSaved={() => setSavedNote(true)}
                        demo={demo}
                    />
                ))}
            </div>
            <p role="status" aria-live="polite" className="sr-only">{savedNote ? t('saved') : ''}</p>
        </fieldset>
    );
}
