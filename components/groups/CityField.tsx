'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Clock, Plus } from 'lucide-react';
import { suggestCity } from '@/actions/city-actions';
import { useCities } from '@/components/providers/CitiesContext';
import { cityLabel } from '@/lib/city-label';
import { type GroupFormValues } from '@/lib/validations/group';

type Props = {
    id: string;
    /** Classes for the select. */
    selectClassName: string;
    /** Classes for the text input (suggestion). */
    inputClassName: string;
    autoFocus?: boolean;
};

/**
 * City select for the group wizard and the group settings. Besides the approved cities it lets the person
 * suggest one that is missing: the group is saved with it right away and a site admin approves it later.
 */
export default function CityField({ id, selectClassName, inputClassName, autoFocus }: Props) {
    const t = useTranslations('wizard');
    const tCities = useTranslations('cities');
    const tErrors = useTranslations('errors');
    const cities = useCities();
    const { register, setValue, watch, formState: { errors } } = useFormContext<GroupFormValues>();
    const value = watch('city');

    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Cities this person suggested in this form (not in the approved list yet).
    const [suggested, setSuggested] = useState<{ slug: string; name: string }[]>([]);
    const [isPending, startTransition] = useTransition();
    // The new option must be in the select before it can be chosen, so the choice is made after the render that adds it.
    const [toSelect, setToSelect] = useState<{ slug: string } | null>(null);
    useEffect(() => {
        if (toSelect) setValue('city', toSelect.slug, { shouldValidate: true, shouldDirty: true });
    }, [toSelect, suggested, setValue]);

    const approved = new Set(cities.map((c) => c.slug));
    const options = [...cities];
    for (const extra of suggested) {
        if (!approved.has(extra.slug)) options.push(extra);
    }
    // A group's own city that is still waiting for approval (or was suggested earlier) is not in the approved list.
    if (value && !options.some((o) => o.slug === value)) options.push({ slug: value, name: cityLabel(tCities, value) });
    const isWaiting = !!value && !approved.has(value);
    const valueName = options.find((o) => o.slug === value)?.name ?? value;

    const submitSuggestion = () => {
        if (isPending) return;
        setError(null);
        startTransition(async () => {
            const result = await suggestCity(draft);
            if (!result.success) {
                setError(tErrors(result.error as 'ACTION_FAILED'));
                return;
            }
            const city = result.data!;
            setSuggested((prev) => (prev.some((p) => p.slug === city.slug) ? prev : [...prev, { slug: city.slug, name: city.name }]));
            setToSelect({ slug: city.slug });
            setDraft('');
            setOpen(false);
        });
    };

    return (
        <div>
            <select
                id={id}
                autoFocus={autoFocus}
                {...register('city')}
                className={clsx(selectClassName, errors.city && 'border-red-400')}
            >
                <option value="">{t('fieldCityPlaceholder')}</option>
                {options.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </select>

            {isWaiting && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-foreground-muted">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{t('citySuggestedHint', { name: valueName })}</span>
                </p>
            )}

            {open ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitSuggestion();
                            }
                        }}
                        placeholder={t('citySuggestPlaceholder')}
                        aria-label={t('citySuggestPlaceholder')}
                        maxLength={60}
                        autoFocus
                        className={inputClassName}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={submitSuggestion}
                            disabled={isPending || draft.trim().length < 2}
                            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-[var(--accent-foreground)] transition-opacity disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            {t('citySuggestAdd')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOpen(false); setError(null); }}
                            className="inline-flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-foreground-muted hover:text-foreground"
                        >
                            {t('citySuggestCancel')}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="mt-2 text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                >
                    {t('citySuggestOpen')}
                </button>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {errors.city?.message && <p className="mt-1 text-xs text-red-500">{t(errors.city.message as 'CITY_REQUIRED')}</p>}
        </div>
    );
}
