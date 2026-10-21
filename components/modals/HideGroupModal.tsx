'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { RefObject } from 'react';
import { EyeOff } from 'lucide-react';
import { hideGroup } from '@/actions/moderation-actions';
import { suspendReportedGroup } from '@/actions/admin-actions';
import { hideGroupSchema } from '@/lib/validations/moderation';
import ReasonModal from './ReasonModal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    /** When hiding from a report: closes that report as well. */
    reportId?: string;
    onHidden?: () => void;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function HideGroupModal({ isOpen, onClose, groupId, reportId, onHidden, returnFocusRef }: Props) {
    const t = useTranslations('moderation');
    const locale = useLocale();
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <ReasonModal
            onClose={onClose}
            returnFocusRef={returnFocusRef}
            icon={<EyeOff className="size-5 shrink-0" />}
            title={t('hideTitle')}
            description={t('hideDescription')}
            reasonLabel={t('reasonLabel')}
            placeholder={t('reasonPlaceholder')}
            hint={t('reasonHint')}
            confirmLabel={t('confirmHide')}
            cancelLabel={t('cancel')}
            schema={hideGroupSchema}
            onSubmit={(reason) => reportId ? suspendReportedGroup(reportId, groupId, reason, locale) : hideGroup(groupId, reason, locale)}
            onDone={() => { onHidden?.(); router.refresh(); }}
        />
    );
}
