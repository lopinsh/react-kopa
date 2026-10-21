'use client';

import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { createCity, deleteCity, renameCity } from '@/actions/city-actions';
import type { ActionResponse } from '@/types/actions';
import type { CityRow } from '@/lib/services/city.service';
import TextCounter from '@/components/ui/TextCounter';
import { CITY_NAME_MAX } from '@/lib/validations/city';

type Props = { cities: CityRow[] };

const INPUT = 'w-full bg-surface line rounded-md px-3 py-2 text-body md:text-body-sm';

/** The approved cities: rename, remove an unused one, add a new one. Pending suggestions are in the "needs review" card above. */
export default function CitiesSection({ cities }: Props) {
    const t = useTranslations('admin.taxonomy.cities');
    const tFields = useTranslations('admin.taxonomy.fields');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [askDelete, setAskDelete] = useState<CityRow | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [nameLv, setNameLv] = useState('');
    const uid = useId();
    const [nameEn, setNameEn] = useState('');

    const active = cities.filter((city) => city.status === 'ACTIVE');

    const run = (action: () => Promise<ActionResponse>, done: string, after?: () => void) => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            if (res.success) {
                success(done);
                after?.();
                router.refresh();
            } else {
                error(tErrors(res.error as 'ACTION_FAILED'));
            }
        });
    };

    const startEdit = (city: CityRow) => {
        setEditingId(city.id);
        setNameLv(city.nameLv);
        setNameEn(city.nameEn);
    };
    const valid = nameLv.trim().length >= 2 && nameEn.trim().length >= 2;

    const form = (onSave: () => void) => (
        <div className="mt-3 rounded-lg line bg-surface-elevated p-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-tag text-foreground-muted">{tFields('nameLv')}</label>
                    <input type="text" aria-describedby={`${uid}-lv`} value={nameLv} onChange={(e) => setNameLv(e.target.value)} className={INPUT} />
                    <TextCounter id={`${uid}-lv`} length={nameLv.length} max={CITY_NAME_MAX} className="mt-1 text-right" />
                </div>
                <div>
                    <label className="mb-1 block text-tag text-foreground-muted">{tFields('nameEn')}</label>
                    <input type="text" aria-describedby={`${uid}-en`} value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={INPUT} />
                    <TextCounter id={`${uid}-en`} length={nameEn.length} max={CITY_NAME_MAX} className="mt-1 text-right" />
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-button-sm text-foreground-muted hover:bg-border rounded-md transition-colors">
                    {c('cancel')}
                </button>
                <button type="button" disabled={isPending || !valid} onClick={onSave} className="px-4 py-2 text-button-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {c('save')}
                </button>
            </div>
        </div>
    );

    return (
        <section className="rounded-2xl line bg-surface p-5 sm:p-6 shadow-card" data-ui="cities-section" aria-labelledby="cities-heading">
            <div className="flex items-center justify-between gap-3">
                <h2 id="cities-heading" className="flex items-center gap-2 text-section">
                    <MapPin className="h-5 w-5 text-foreground-muted" />
                    {t('title')}
                    <span className="rounded-pill bg-surface-elevated px-2 py-0.5 text-tag text-foreground-muted">{active.length}</span>
                </h2>
                <button
                    type="button"
                    onClick={() => { setEditingId('new'); setNameLv(''); setNameEn(''); }}
                    className="rounded-md bg-surface-elevated px-3 py-1.5 text-button-sm transition-colors hover:bg-border"
                >
                    {t('add')}
                </button>
            </div>

            {editingId === 'new' && form(() => run(() => createCity({ nameLv, nameEn }), t('added'), () => setEditingId(null)))}

            <ul className="mt-4 divide-y divide-border">
                {active.map((city) => (
                    <li key={city.id} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate weight-strong">
                                    {city.nameLv}
                                    {city.nameEn !== city.nameLv && <span className="ml-2 font-normal text-foreground-muted">{city.nameEn}</span>}
                                </p>
                                <p className="text-meta text-foreground-muted">{t('groups', { count: city.groupCount })}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <button type="button" aria-label={t('rename')} title={t('rename')} onClick={() => startEdit(city)} className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={c('delete')}
                                    title={city.groupCount > 0 ? t('inUse') : c('delete')}
                                    disabled={isPending || city.groupCount > 0}
                                    onClick={() => setAskDelete(city)}
                                    className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        {editingId === city.id && form(() => run(() => renameCity(city.id, { nameLv, nameEn }), t('renamed'), () => setEditingId(null)))}
                    </li>
                ))}
            </ul>
            <ConfirmDialog
                isOpen={askDelete !== null}
                title={t('deleteCityTitle')}
                message={askDelete ? t('confirmDelete', { name: askDelete.nameLv }) : ''}
                confirmLabel={c('delete')}
                destructive
                isPending={isPending}
                onConfirm={() => { if (askDelete) run(() => deleteCity(askDelete.id), t('deleted'), () => setAskDelete(null)); }}
                onCancel={() => setAskDelete(null)}
            />
        </section>
    );
}
