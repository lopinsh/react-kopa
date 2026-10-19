'use client';

import { useState, useTransition } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { deleteGroup } from '@/actions/group-actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { isOwner as checkIsOwner } from '@/lib/utils/permissions';
import AcceptingMembersSection from './AcceptingMembersSection';
import PrivacySection from './PrivacySection';
import TransferOwnershipSection from './TransferOwnershipSection';
import DangerZoneSection from './DangerZoneSection';
import SaveRow from './SaveRow';
import { useGroupSettingsForm, type GroupSettingsFormProps } from './useGroupSettingsForm';

type Props = GroupSettingsFormProps & {
    /** Members and moderators the owner could hand the group to. */
    transferCandidates: Array<{ userId: string; name: string; role: 'ADMIN' | 'MEMBER' }>;
};

/** Owner tab: who can find and join the group, handing it over, deleting it. The page only offers this tab to the owner. */
export default function OwnerTab({ transferCandidates, ...formProps }: Props) {
    const gt = useTranslations('group');
    const c_common = useTranslations('common');
    // Only the owner hands the group over or deletes it.
    const isOwner = checkIsOwner(useGroupContext().user.role);
    const { methods, onSubmit, isPending: savePending, serverError, saveBlocked } = useGroupSettingsForm(formProps);
    const [deletePending, startDelete] = useTransition();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const { group, locale } = formProps;
    const isPending = savePending || deletePending;

    const handleDelete = () => {
        if (isPending) return;
        startDelete(async () => {
            // On success the action redirects to the start page itself; only a failure comes back.
            const result = await deleteGroup(group.id, locale);
            if (!result.success) setDeleteConfirmOpen(false);
        });
    };

    return (
        <div className="space-y-4">
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                    <AcceptingMembersSection />
                    <div id="access" className="scroll-mt-24">
                        <PrivacySection />
                    </div>
                    <SaveRow isPending={savePending} disabled={saveBlocked} serverError={serverError} />
                </form>
            </FormProvider>

            {isOwner && (
                <>
                    <TransferOwnershipSection groupId={group.id} locale={locale} candidates={transferCandidates} />
                    <div id="danger-zone" className="scroll-mt-24">
                        <DangerZoneSection onDelete={() => setDeleteConfirmOpen(true)} isPending={isPending} />
                        <ConfirmDialog
                            isOpen={deleteConfirmOpen}
                            title={c_common('deleteGroupTitle')}
                            message={gt('deleteConfirmNamed', { name: group.name })}
                            confirmLabel={c_common('deleteGroupTitle')}
                            destructive
                            isPending={isPending}
                            onConfirm={handleDelete}
                            onCancel={() => setDeleteConfirmOpen(false)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
