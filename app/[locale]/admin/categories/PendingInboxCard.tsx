import { useId, useRef, useState, useTransition } from 'react';
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

import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
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

    const [activeAction, setActiveAction] = useState<'merge' | null>(null);

    // Approve form state
    // The suggestion exists in one language only; the admin fills in the other one.
    const isLv = item.submittedLang === 'lv';
    const uid = useId();
    const [nameEn, setNameEn] = useState(isLv ? '' : item.submittedLabel);
    const [nameLv, setNameLv] = useState(isLv ? item.submittedLabel : '');
    // Slugs follow the names.
    const slugEn = slugify(nameEn);
    const slugLv = slugify(nameLv);
    // The language the suggestion lacks: highlighted, and focused when "Approve" is pressed with it empty.
    const missingRef = useRef<HTMLInputElement>(null);
    const missing = !nameEn.trim() ? 'en' : !nameLv.trim() ? 'lv' : null;

    // Merge form state
    const [mergeIntoId, setMergeIntoId] = useState('');
    const mergeTarget = canonicalOptions.find((c) => c.id === mergeIntoId);

    const handleApprove = async () => {
        if (missing) {
            missingRef.current?.focus();
            return;
        }
        startTransition(async () => {
            const res = await approveTag(item.id, {
                nameEn: nameEn.trim(),
                nameLv: nameLv.trim(),
                slugEn: slugEn.trim(),
                slugLv: slugLv.trim()
            });
            if (res.success) {
                success(t('approve') + ' - ' + c('success'));
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
                    <h3 className="text-item cursor-pointer hover:underline break-words" onClick={onSelect}>
                        {item.submittedLabel}
                    </h3>
                    <p className="text-tag text-foreground-muted mt-1">
                        {t('writtenIn', { lang: item.submittedLang.toUpperCase() })}
                    </p>
                    <p className="text-body-sm text-foreground-muted mt-1">
                        {t('submittedBy', { 
                            name: item.submitter?.username || t('unknown'), 
                            date: item.submittedAt ? format.dateTime(new Date(item.submittedAt), { dateStyle: 'medium' }) : '–' 
                        })}
                    </p>
                    {item.parent && (
                        <p className="text-body-sm mt-1">
                            {t('parentLabel', { title: item.parent.title })}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button size="sm" onClick={handleApprove} disabled={isPending}>{c('approve')}</Button>
                    <button
                        type="button"
                        onClick={() => setActiveAction(activeAction === 'merge' ? null : 'merge')}
                        className={`px-3 py-1.5 text-button rounded-pill transition-colors ${activeAction === 'merge' ? 'bg-warning text-warning-foreground' : 'bg-warning/10 hover:bg-warning/10 text-warning '}`}
                    >
                        {c('merge')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAskReject(true)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-button-sm rounded-md text-danger bg-danger/10 hover:bg-danger/10 transition-colors"
                    >
                        {c('reject')}
                    </button>
                </div>
            </div>

            {item.groups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-tag text-foreground-muted mb-2">{t('usedByGroups')}</p>
                    <div className="flex flex-wrap gap-2">
                        {item.groups.map(g => (
                            <Link
                                key={g.id}
                                href={`/admin/groups/${g.l1Slug}/${g.slug}/categorization`}
                                className="text-body-sm bg-surface-elevated hover:bg-border px-2 py-1 rounded-md transition-colors"
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* The names are written here, so approving is one press; the empty language is the one to fill in. */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${uid}-en-input`} className="block text-tag text-foreground-muted mb-1">{tFields('nameEn')}</label>
                    <Input
                        id={`${uid}-en-input`}
                        ref={missing === 'en' ? missingRef : undefined}
                        type="text" aria-describedby={`${uid}-en`}
                        aria-invalid={missing === 'en' ? true : undefined}
                        className={missing === 'en' ? 'ring-2 ring-warning' : undefined}
                        value={nameEn}
                        onChange={e => setNameEn(e.target.value)}
                    />
                    <TextCounter id={`${uid}-en`} length={nameEn.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                </div>
                <div>
                    <label htmlFor={`${uid}-lv-input`} className="block text-tag text-foreground-muted mb-1">{tFields('nameLv')}</label>
                    <Input
                        id={`${uid}-lv-input`}
                        ref={missing === 'lv' ? missingRef : undefined}
                        type="text" aria-describedby={`${uid}-lv`}
                        aria-invalid={missing === 'lv' ? true : undefined}
                        className={missing === 'lv' ? 'ring-2 ring-warning' : undefined}
                        value={nameLv}
                        onChange={e => setNameLv(e.target.value)}
                    />
                    <TextCounter id={`${uid}-lv`} length={nameLv.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                </div>
            </div>

            {activeAction === 'merge' && (
                <div className="mt-4 p-4 bg-surface-elevated rounded-lg line">
                    <label className="block text-tag text-foreground-muted mb-2">{t('mergeCanonicalTitle')}</label>
                    <Select
                        value={mergeIntoId}
                        onChange={e => setMergeIntoId(e.target.value)}
                        className="mb-4"
                    >
                        <option value="">{t('selectCategoryPlaceholder')}</option>
                        {canonicalOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {pickTitle(opt.translations, 'en', opt.slug)}
                            </option>
                        ))}
                    </Select>

                    {mergeIntoId && (
                        <div className="mb-4">
                            <p className="text-meta text-foreground-muted mb-1">{t('selectedCanonicalLabel')}</p>
                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-pill text-button-sm">
                                {mergeTarget && pickTitle(mergeTarget.translations, 'en', mergeTarget.slug)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setActiveAction(null)} className="px-4 py-2 text-button-sm text-foreground-muted hover:bg-border rounded-md transition-colors">
                            {c('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleMerge}
                            disabled={isPending || !mergeIntoId}
                            className="px-4 py-2 text-button-sm bg-warning text-warning-foreground rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
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
