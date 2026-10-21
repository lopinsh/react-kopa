'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Trash2 } from 'lucide-react';
import { deleteHiddenGroup } from '@/actions/moderation-actions';
import { deleteGroupSchema } from '@/lib/validations/moderation';
import ReasonModal from './ReasonModal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    /** The reason the group was hidden with; the form starts with it so the owner only edits when something else applies. */
    initialReason?: string;
};

export default function DeleteHiddenGroupModal({ isOpen, onClose, groupId, groupName, initialReason = '' }: Props) {
    const t = useTranslations('moderation');
    const locale = useLocale();
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <ReasonModal
            onClose={onClose}
            icon={<Trash2 className="size-5 shrink-0" />}
            title={t('deleteTitle')}
            subject={groupName}
            description={t('deleteDescription')}
            reasonLabel={t('deleteReasonLabel')}
            placeholder={t('deletePlaceholder')}
            hint={t('reasonHint')}
            confirmLabel={t('confirmDelete')}
            cancelLabel={t('cancel')}
            initialReason={initialReason}
            schema={deleteGroupSchema}
            onSubmit={(reason) => deleteHiddenGroup(groupId, reason, locale)}
            onDone={() => router.refresh()}
        />
    );
}
