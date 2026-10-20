import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { pickTitle } from '@/lib/utils/localized-title';
import { useDateFormatter } from '@/lib/date-format';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { slugify } from '@/lib/slug';
import { approveTag, mergeTag } from '@/actions/taxonomy-actions';
import { rejectWildcard } from '@/actions/admin-actions';
import { useToast } from '@/hooks/use-toast';
import type { PendingCategoryWithContext, ActiveL2WithAliases } from '@/lib/services/taxonomy.service';
import TextCounter from '@/components/ui/TextCounter';
import { CATEGORY_NAME_MAX } from '@/lib/constants';

type Props = {
    item: PendingCategoryWithContext;
    canonicalOptions: ActiveL2WithAliases[];
    onSelect: () => void;
};

export default function PendingInboxCard({ item, canonicalOptions, onSelect }: Props) {
    const t = useTranslations('admin.taxonomy.inbox');
    const format = useDateFormatter();
    const tFields = useTranslations('admin.taxonomy.fields');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [askReject, setAskReject] = useState(false);

    const [activeAction, setActiveAction] = useState<'approve' | 'merge' | null>(null);

    // Approve form state
    // The suggestion exists in one language only; the admin fills in the other one.
    const isLv = item.submittedLang === 'lv';
    const uid = useId();
    const [nameEn, setNameEn] = useState(isLv ? '' : item.submittedLabel);
    const [nameLv, setNameLv] = useState(isLv ? item.submittedLabel : '');
    const [slugEn, setSlugEn] = useState(isLv ? '' : slugify(item.submittedLabel));
    const [slugLv, setSlugLv] = useState(isLv ? slugify(item.submittedLabel) : '');

    // Merge form state
    const [mergeIntoId, setMergeIntoId] = useState('');
    const mergeTarget = canonicalOptions.find((c) => c.id === mergeIntoId);

    const handleApprove = async () => {
        startTransition(async () => {
            const res = await approveTag(item.id, {
                nameEn: nameEn.trim(),
                nameLv: nameLv.trim(),
                slugEn: slugEn.trim(),
                slugLv: slugLv.trim()
            });
            if (res.success) {
                success(t('approve') + ' - ' + c('success'));
                setActiveAction(null);
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    const handleMerge = async () => {
        if (!mergeIntoId) return;
        startTransition(async () => {
            const res = await mergeTag(item.id, mergeIntoId, 'en'); // Locale mainly used for localized notification canonical name
            if (res.success) {
                success(t('merge') + ' - ' + c('success'));
                setActiveAction(null);
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    const handleReject = async () => {
        setAskReject(false);
        startTransition(async () => {
            const res = await rejectWildcard(item.id);
            if (res.success) {
                success(c('reject') + ' - ' + c('success'));
                router.refresh();
            } else {
                error(res.error === 'CATEGORY_IN_USE' ? tErrors('CATEGORY_IN_USE') : c('error'));
            }
        });
    };

    return (
        <div className="rounded-2xl line bg-surface p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h3 className="text-xl font-bold cursor-pointer hover:underline break-words" onClick={onSelect}>
                        {item.submittedLabel}
                    </h3>
                    <p className="text-xs font-semibold text-foreground-muted mt-1">
                        {t('writtenIn', { lang: item.submittedLang.toUpperCase() })}
                    </p>
                    <p className="text-sm text-foreground-muted mt-1">
                        {t('submittedBy', { 
                            name: item.submitter?.username || t('unknown'), 
                            date: item.submittedAt ? format.dateTime(new Date(item.submittedAt), { dateStyle: 'medium' }) : '–' 
                        })}
                    </p>
                    {item.parent && (
                        <p className="text-sm font-medium mt-1">
                            {t('parentLabel', { title: item.parent.title })}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-pill transition-colors ${activeAction === 'approve' ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated hover:bg-border'}`}
                    >
                        {c('approve')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveAction(activeAction === 'merge' ? null : 'merge')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-pill transition-colors ${activeAction === 'merge' ? 'bg-warning text-background' : 'bg-warning/10 hover:bg-warning/10 text-warning '}`}
                    >
                        {c('merge')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAskReject(true)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-sm font-semibold rounded text-danger bg-danger/10 hover:bg-danger/10 transition-colors"
                    >
                        {c('reject')}
                    </button>
                </div>
            </div>

            {item.groups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-foreground-muted mb-2">{t('usedByGroups')}</p>
                    <div className="flex flex-wrap gap-2">
                        {item.groups.map(g => (
                            <Link
                                key={g.id}
                                href={`/admin/groups/${g.l1Slug}/${g.slug}/categorization`}
                                className="text-sm bg-surface-elevated hover:bg-border px-2 py-1 rounded transition-colors"
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Expando Forms */}
            {activeAction === 'approve' && (
                <div className="mt-4 p-4 bg-surface-elevated rounded-lg line">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameEn')}</label>
                            <input
                                type="text" aria-describedby={`${uid}-en`}
                                value={nameEn}
                                onChange={e => { setNameEn(e.target.value); setSlugEn(slugify(e.target.value)); }}
                                className="w-full bg-surface line rounded px-3 py-2 text-sm"
                            />
                            <TextCounter id={`${uid}-en`} length={nameEn.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameLv')}</label>
                            <input
                                type="text" aria-describedby={`${uid}-lv`}
                                value={nameLv}
                                onChange={e => { setNameLv(e.target.value); setSlugLv(slugify(e.target.value)); }}
                                className="w-full bg-surface line rounded px-3 py-2 text-sm"
                            />
                            <TextCounter id={`${uid}-lv`} length={nameLv.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('slugEn')}</label>
                            <input
                                type="text"
                                value={slugEn}
                                onChange={e => setSlugEn(e.target.value)}
                                className="w-full bg-surface line rounded px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('slugLv')}</label>
                            <input
                                type="text"
                                value={slugLv}
                                onChange={e => setSlugLv(e.target.value)}
                                className="w-full bg-surface line rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setActiveAction(null)} className="px-4 py-2 text-sm font-semibold text-foreground-muted hover:bg-border rounded transition-colors">
                            {c('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={isPending || !nameEn || !nameLv || !slugEn || !slugLv}
                            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {c('confirm')}
                        </button>
                    </div>
                </div>
            )}

            {activeAction === 'merge' && (
                <div className="mt-4 p-4 bg-surface-elevated rounded-lg line">
                    <label className="block text-xs font-semibold text-foreground-muted mb-2">{t('mergeCanonicalTitle')}</label>
                    <select
                        value={mergeIntoId}
                        onChange={e => setMergeIntoId(e.target.value)}
                        className="w-full bg-surface line rounded px-3 py-2 text-sm mb-4"
                    >
                        <option value="">{t('selectCategoryPlaceholder')}</option>
                        {canonicalOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {pickTitle(opt.translations, 'en', opt.slug)}
                            </option>
                        ))}
                    </select>

                    {mergeIntoId && (
                        <div className="mb-4">
                            <p className="text-xs text-foreground-muted mb-1">{t('selectedCanonicalLabel')}</p>
                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-pill text-sm font-medium">
                                {mergeTarget && pickTitle(mergeTarget.translations, 'en', mergeTarget.slug)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setActiveAction(null)} className="px-4 py-2 text-sm font-semibold text-foreground-muted hover:bg-border rounded transition-colors">
                            {c('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleMerge}
                            disabled={isPending || !mergeIntoId}
                            className="px-4 py-2 text-sm font-semibold bg-warning text-background rounded hover:opacity-90 transition-colors disabled:opacity-50"
                        >
                            {t('mergeAndNotify')}
                        </button>
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={askReject}
                title={t('rejectTitle')}
                message={t('confirmReject')}
                confirmLabel={c('reject')}
                destructive
                isPending={isPending}
                onConfirm={handleReject}
                onCancel={() => setAskReject(false)}
            />
        </div>
    );
}
