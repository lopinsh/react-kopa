import { getTranslations } from 'next-intl/server';
import TextLink from '@/components/ui/TextLink';
import type { PrivacySettings } from '@/lib/types/profile';

/** One quiet line over Mans profils: what the page shows is what others see, and where to change it (R9c). */
export default async function ProfileViewerNote({ privacy }: { privacy: PrivacySettings }) {
    const t = await getTranslations('profile.view');
    return (
        <p className="max-w-[680px] text-sm text-foreground-muted">
            {privacy.isProfilePublic
                ? <>{t('asOthersSee')}{!privacy.showGroupsOnProfile && ` ${t('groupsHidden')}`}</>
                : t('privateNote')}{' '}
            <TextLink href="/settings#privacy">{t('changePrivacy')}</TextLink>
        </p>
    );
}
