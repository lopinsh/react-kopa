'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import TextCounter from '@/components/ui/TextCounter';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useToast } from '@/hooks/use-toast';
import { useAuthGate } from '@/lib/useAuthGate';
import { submitPendingTag } from '@/actions/taxonomy-actions';
import { submitPendingTagSchema } from '@/lib/validations/taxonomy';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { CATEGORY_NAME_MAX } from '@/lib/constants';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/** "Ieteikt jaunu kategoriju": the typed word goes to the admins as a waiting Veids of the chosen Tēma. Signed out: the sign-in pop-up. */
export default function CategorySuggest({ word, onClose }: { word: string; onClose: () => void }) {
    const t = useTranslations('discovery');
    const tErrors = useTranslations('errors');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const toast = useToast();
    const { categories } = useDiscovery();
    const { params } = useDiscoveryNav();
    const { status } = useSession();
    const { isAuthenticated, isModalOpen, closeModal, gateAction } = useAuthGate();
    const [name, setName] = useState(word.slice(0, CATEGORY_NAME_MAX));
    const [topicId, setTopicId] = useState(categories.find((c) => c.slug === params.category)?.id ?? '');
    const [isPending, setIsPending] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const submit = () => {
        if (isPending) return;
        const parsed = submitPendingTagSchema.safeParse({ label: name, parentId: topicId });
        if (!parsed.success) { setInvalid(true); return; }
        setInvalid(false);
        gateAction(() => {
            setIsPending(true);
            void submitPendingTag(parsed.data.label, parsed.data.parentId, locale).then((res) => {
                setIsPending(false);
                if (res.success) { toast.success(t('suggestSent')); onClose(); }
                else toast.error(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }, () => { setIsPending(false); toast.error(tErrors('ACTION_FAILED')); });
        });
    };

    // Signed out: the sign-in pop-up instead of the dialog.
    if (status === 'unauthenticated') return <AuthGateModal isOpen onClose={onClose} />;
    if (!isAuthenticated && isModalOpen) return <AuthGateModal isOpen onClose={closeModal} />;
    return (
        <Modal onClose={onClose} title={t('suggestTitle')} locked={isPending}>
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-3">
                <p className="text-body-sm text-foreground-muted">{t('suggestText')}</p>
                <div>
                    <label htmlFor="suggest-name" className="mb-1 block text-button-sm">{t('suggestName')}</label>
                    <input id="suggest-name" value={name} onChange={(e) => setName(e.target.value)} aria-describedby="suggest-count" className="h-11 w-full rounded-xl bg-surface px-3 text-body md:text-body-sm ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)] focus:outline-none focus:ring-2 focus:ring-primary" />
                    <TextCounter id="suggest-count" length={name.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                </div>
                <div>
                    <label htmlFor="suggest-topic" className="mb-1 block text-button-sm">{t('topic')}</label>
                    <select id="suggest-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className="h-11 w-full rounded-xl bg-surface px-3 text-body md:text-body-sm ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)] focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">—</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    {invalid && !topicId && <p role="alert" className="mt-1 text-meta text-danger">{t('suggestPickTopic')}</p>}
                </div>
                <div className="mt-1 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>{tCommon('cancel')}</Button>
                    <Button type="submit" disabled={isPending || name.trim().length < 2}>{t('suggestSend')}</Button>
                </div>
            </form>
        </Modal>
    );
}
