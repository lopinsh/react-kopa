'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, USER_BIO_MAX, USER_NAME_MAX, type ProfileFormValues } from '@/lib/validations/user';
import TextCounter from '@/components/ui/TextCounter';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AvatarField from './AvatarField';
import { isOverLimit } from '@/lib/text-limit';
import { updateProfile } from '@/actions/user-actions';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';

type Props = {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        username?: string | null;
        bio?: string | null;
        cities?: string[];
        avatarSeed?: string | null;
    };
};

const INPUT = 'w-full rounded-xl line bg-surface px-4 py-3 text-body text-foreground placeholder:text-foreground-muted outline-none transition-all focus:border-primary';

/** Labot profilu: name, username, picture, about you and places. The privacy switches are in Iestatījumi, not here (OD-26). */
export default function ProfileEditForm({ user }: Props) {
    const t = useTranslations('profile');
    const tv = useTranslations('profile.edit.validation');
    const tErrors = useTranslations('errors');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition();
    const [askDiscard, setAskDiscard] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            image: user.image || '',
            username: user.username || '',
            bio: user.bio || '',
            cities: (user.cities || []).join(', '),
            avatarSeed: user.avatarSeed || '',
        },
    });
    const { errors, isDirty } = form.formState;

    // Leaving the page (reload, closing the tab) with typed changes asks first.
    useEffect(() => {
        if (!isDirty || leaving) return;
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [isDirty, leaving]);

    const [watchedImage, watchedSeed, watchedName, watchedBio] = useWatch({ control: form.control, name: ['image', 'avatarSeed', 'name', 'bio'] });
    const over = isOverLimit(watchedName, USER_NAME_MAX) || isOverLimit(watchedBio, USER_BIO_MAX);

    const fieldError = (message?: string) =>
        message ? <p className="text-meta text-danger">{tv(message as 'NAME_TOO_SHORT')}</p> : null;

    const onSubmit = (data: ProfileFormValues) => {
        if (isPending || over) return;
        startTransition(async () => {
            const result = await updateProfile(data);
            if (result.success) {
                setLeaving(true);
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

    const cancel = () => (isDirty ? setAskDiscard(true) : router.push('/profile'));

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AvatarField
                userId={user.id}
                image={watchedImage}
                seed={watchedSeed}
                onNewSeed={(seed) => form.setValue('avatarSeed', seed, { shouldDirty: true })}
            />

            <div className="space-y-2">
                <label htmlFor="name" className="block text-button-sm text-foreground">{t('fieldName')}</label>
                <input id="name" {...form.register('name')} aria-describedby="name-count" className={INPUT} />
                <div className="flex items-start gap-2">{fieldError(errors.name?.message)}<TextCounter id="name-count" length={(watchedName ?? '').length} max={USER_NAME_MAX} /></div>
            </div>

            <div className="space-y-2">
                <label htmlFor="username" className="block text-button-sm text-foreground">{tCommon('username')}</label>
                <div className="relative">
                    <span className="absolute left-4 top-3 weight-strong text-foreground-muted">@</span>
                    <input id="username" {...form.register('username')} className={`${INPUT} pl-10`} />
                </div>
                {fieldError(errors.username?.message)}
            </div>

            <div className="space-y-2">
                <label htmlFor="bio" className="block text-button-sm text-foreground">{t('edit.bio')}</label>
                <textarea
                    id="bio"
                    {...form.register('bio')}
                    aria-describedby="bio-count"
                    placeholder={t('edit.bioPlaceholder')}
                    rows={4}
                    className={`${INPUT} resize-none`}
                />
                <div className="flex items-start gap-2">{fieldError(errors.bio?.message)}<TextCounter id="bio-count" length={(watchedBio ?? '').length} max={USER_BIO_MAX} /></div>
            </div>

            <div className="space-y-2">
                <label htmlFor="cities" className="block text-button-sm text-foreground">{t('edit.citiesLabel')}</label>
                <input id="cities" {...form.register('cities')} placeholder={t('edit.citiesPlaceholder')} className={INPUT} />
            </div>

            <div className="space-y-2">
                <label htmlFor="image" className="block text-button-sm text-foreground">{t('fieldImage')}</label>
                <input id="image" {...form.register('image')} placeholder="https://..." className={INPUT} />
                {fieldError(errors.image?.message)}
            </div>

            {errors.root?.message && (
                <p role="alert" className="text-body-sm text-danger">{tErrors(errors.root.message as 'ACTION_FAILED')}</p>
            )}

            <div className="flex gap-2">
                <Button type="submit" disabled={isPending || over}>
                    {isPending && <Loader2 aria-hidden className="animate-spin" />}
                    {tCommon('saveChanges')}
                </Button>
                <Button variant="quiet" disabled={isPending} onClick={cancel}>{tCommon('cancel')}</Button>
            </div>

            <ConfirmDialog
                isOpen={askDiscard}
                title={tCommon('discardTitle')}
                message={tCommon('discardText')}
                confirmLabel={tCommon('discard')}
                destructive
                onConfirm={() => { setLeaving(true); router.push('/profile'); }}
                onCancel={() => setAskDiscard(false)}
            />
        </form>
    );
}
