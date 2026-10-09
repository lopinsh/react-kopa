'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { transferOwnership } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import SettingsSection from './SettingsSection';

type Candidate = { userId: string; name: string; role: 'ADMIN' | 'MEMBER' };

type Props = {
    groupId: string;
    locale: string;
    /** Members and moderators (not requests). */
    candidates: Candidate[];
};

/** Owner only: hand the group to another member. They become the owner, you become a moderator. */
export default function TransferOwnershipSection({ groupId, locale, candidates }: Props) {
    const t = useTranslations('groupSettings');
    const tc = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const [targetId, setTargetId] = useState('');
    const [confirming, setConfirming] = useState(false);

    const target = candidates.find(c => c.userId === targetId);

    function handleTransfer() {
        if (!target || isPending) return;
        startTransition(async () => {
            const result = await transferOwnership(groupId, target.userId, locale);
            if (result.success) {
                success(t('transferDone', { name: target.name }));
                setConfirming(false);
                setTargetId('');
                router.refresh();
            } else {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    }

    return (
        <div id="transfer" className="scroll-mt-24">
            <SettingsSection title={t('transferTitle')} description={t('transferDescription')} icon={ArrowRightLeft}>
                {candidates.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-foreground-muted">{t('transferNobody')}</p>
                ) : (
                    <div className="max-w-xl space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="transfer-target" className="ml-1 text-xs font-black uppercase tracking-wider text-foreground-muted">
                                {t('transferSelectLabel')}
                            </label>
                            <select
                                id="transfer-target"
                                value={targetId}
                                onChange={(e) => { setTargetId(e.target.value); setConfirming(false); }}
                                disabled={isPending}
                                className="w-full rounded-2xl border border-border bg-surface-elevated/20 px-4 py-3.5 font-medium outline-none transition-all focus:border-[var(--accent)]"
                            >
                                <option value="">{t('transferSelectPlaceholder')}</option>
                                {candidates.map(c => (
                                    <option key={c.userId} value={c.userId}>
                                        {c.role === 'ADMIN' ? `${c.name} (${tc('role_admin')})` : c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!confirming ? (
                            <button
                                type="button"
                                disabled={!target || isPending}
                                onClick={() => setConfirming(true)}
                                className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-surface px-6 text-sm font-bold text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
                            >
                                {t('transferButton')}
                            </button>
                        ) : (
                            <div role="alertdialog" className="space-y-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 p-4">
                                <p className="text-sm font-semibold text-foreground">{t('transferConfirm', { name: target?.name ?? '' })}</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleTransfer}
                                        disabled={isPending}
                                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] disabled:opacity-70"
                                    >
                                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {t('transferConfirmYes')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirming(false)}
                                        disabled={isPending}
                                        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-elevated"
                                    >
                                        {tc('cancel')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SettingsSection>
        </div>
    );
}
