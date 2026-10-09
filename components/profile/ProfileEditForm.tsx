'use client';

import { useTransition } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/lib/validations/user';
import { updateProfile } from '@/actions/user-actions';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Dices, Loader2, Save } from 'lucide-react';
import { avatarUrl } from '@/lib/avatar';

type Props = {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        username?: string | null;
        bio?: string | null;
        cities?: string[];
        avatarSeed?: string | null;
        isProfilePublic: boolean;
        allowDirectMessages: boolean;
        showGroupsOnProfile: boolean;
    };
};

const INPUT = 'w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground-muted outline-none transition-all focus:border-primary';

function SwitchRow({ label, description, registration }: { label: string; description: string; registration: UseFormRegisterReturn }) {
    return (
        <label className="flex cursor-pointer items-start gap-4 py-3">
            <div className="flex-1">
                <span className="block text-sm font-bold text-foreground">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-foreground-muted">{description}</span>
            </div>
            <div className="relative mt-0.5 flex shrink-0 items-center">
                <input type="checkbox" className="peer sr-only" {...registration} />
                <div className="h-5 w-9 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
        </label>
    );
}

export default function ProfileEditForm({ user }: Props) {
    const t = useTranslations('profile');
    const tv = useTranslations('profile.edit.validation');
    const tErrors = useTranslations('errors');
    const c_common = useTranslations('common');
    const router = useRouter();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            image: user.image || '',
            username: user.username || '',
            bio: user.bio || '',
            cities: (user.cities || []).join(', '),
            avatarSeed: user.avatarSeed || '',
            isProfilePublic: user.isProfilePublic,
            allowDirectMessages: user.allowDirectMessages,
            showGroupsOnProfile: user.showGroupsOnProfile,
        },
    });
    const { errors } = form.formState;

    // Live preview: a photo URL wins, otherwise the clay figure for the current seed.
    const [watchedImage, watchedSeed] = form.watch(['image', 'avatarSeed']);
    const previewSrc = avatarUrl({ id: user.id, image: watchedImage, avatarSeed: watchedSeed });

    const fieldError = (message?: string) =>
        message ? <p className="text-xs text-red-500">{tv(message as 'NAME_TOO_SHORT')}</p> : null;

    const onSubmit = (data: ProfileFormValues) => {
        if (isPending) return;
        startTransition(async () => {
            const result = await updateProfile(data);
            if (result.success) {
                await update({ name: data.name, image: data.image, avatarSeed: data.avatarSeed || null });
                router.push('/profile');
                router.refresh();
            } else if (result.error === 'USERNAME_TAKEN') {
                form.setError('username', { message: 'USERNAME_TAKEN' });
            } else {
                form.setError('root', { message: result.error });
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-6">
                <img
                    src={previewSrc}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-3xl bg-surface-elevated object-cover"
                    referrerPolicy="no-referrer"
                />
                <button
                    type="button"
                    onClick={() => form.setValue('avatarSeed', Math.random().toString(36).slice(2, 10), { shouldDirty: true })}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-elevated soft-press"
                >
                    <Dices className="h-4 w-4" />
                    {t('edit.newAvatar')}
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-bold text-foreground">{t('fieldName')}</label>
                    <input id="name" {...form.register('name')} className={INPUT} />
                    {fieldError(errors.name?.message)}
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-bold text-foreground">{c_common('username')}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 font-bold text-foreground-muted">@</span>
                        <input id="username" {...form.register('username')} className={`${INPUT} pl-10`} />
                    </div>
                    {fieldError(errors.username?.message)}
                </div>

                <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-bold text-foreground">{t('edit.bio')}</label>
                    <textarea
                        id="bio"
                        {...form.register('bio')}
                        placeholder={t('edit.bioPlaceholder')}
                        rows={4}
                        className={`${INPUT} resize-none`}
                    />
                    {fieldError(errors.bio?.message)}
                </div>

                <div className="space-y-2">
                    <label htmlFor="cities" className="block text-sm font-bold text-foreground">{t('edit.citiesLabel')}</label>
                    <input id="cities" {...form.register('cities')} placeholder={t('edit.citiesPlaceholder')} className={INPUT} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="image" className="block text-sm font-bold text-foreground">{t('fieldImage')}</label>
                    <input id="image" {...form.register('image')} placeholder="https://..." className={INPUT} />
                    {fieldError(errors.image?.message)}
                </div>
            </div>

            <fieldset className="rounded-2xl border border-border px-5 py-2">
                <legend className="px-2 text-sm font-black uppercase tracking-widest text-foreground-muted">
                    {t('edit.privacy.title')}
                </legend>
                <div className="divide-y divide-border">
                    <SwitchRow
                        label={t('edit.privacy.publicProfile')}
                        description={t('edit.privacy.publicProfileDesc')}
                        registration={form.register('isProfilePublic')}
                    />
                    <SwitchRow
                        label={t('edit.privacy.allowMessages')}
                        description={t('edit.privacy.allowMessagesDesc')}
                        registration={form.register('allowDirectMessages')}
                    />
                    <SwitchRow
                        label={t('edit.privacy.showGroups')}
                        description={t('edit.privacy.showGroupsDesc')}
                        registration={form.register('showGroupsOnProfile')}
                    />
                </div>
            </fieldset>

            {errors.root?.message && (
                <p role="alert" className="text-sm text-red-500">{tErrors(errors.root.message as 'ACTION_FAILED')}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {c_common('saveChanges')}
            </button>
        </form>
    );
}
