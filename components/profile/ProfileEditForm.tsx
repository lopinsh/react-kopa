'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/lib/validations/user';
import { updateProfile } from '@/actions/user-actions';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Save, User } from 'lucide-react';

type Props = {
    user: {
        name: string | null;
        image: string | null;
        username?: string | null;
        bio?: string | null;
        cities?: string[];
        avatarSeed?: string | null;
    };
};

export default function ProfileEditForm({ user }: Props) {
    const t = useTranslations('profile');
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
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        startTransition(async () => {
            const result = await updateProfile(data);
            if (result.success) {
                await update({ name: data.name, image: data.image });
                router.push('/profile');
                router.refresh();
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-6 mb-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    {user.image ? (
                        <img src={user.image || undefined} alt="" className="h-full w-full rounded-3xl object-cover" />
                    ) : (
                        <User className="h-10 w-10" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold">{user.name || 'Anonymous User'}</h3>
                    <p className="text-sm text-foreground-muted">Update your public profile information.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        {t('fieldName')}
                    </label>
                    <input
                        {...form.register('name')}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        {t('handle', { username: 'Username' }).replace('@Username', 'Username')} {/* Placeholder label logic */}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-foreground-muted font-bold">@</span>
                        <input
                            {...form.register('username')}
                            placeholder="username"
                            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 outline-none focus:border-primary transition-all"
                        />
                    </div>
                    {form.formState.errors.username && (
                        <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        {t('edit.bio')}
                    </label>
                    {/* TODO: Add proper rich-text editor setup once a sanitization library is added. For now, using standard textarea. */}
                    <textarea
                        {...form.register('bio')}
                        rows={4}
                        placeholder="Tell the community about yourself..."
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition-all resize-none"
                    />
                    {form.formState.errors.bio && (
                        <p className="text-xs text-red-500">{form.formState.errors.bio.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        Cities (comma separated)
                    </label>
                    <input
                        {...form.register('cities')}
                        placeholder="Riga, Liepaja, Valmiera..."
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                    {form.formState.errors.cities && (
                        <p className="text-xs text-red-500">{form.formState.errors.cities.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        {t('fieldImage')}
                    </label>
                    <input
                        {...form.register('image')}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                    {form.formState.errors.image && (
                        <p className="text-xs text-red-500">{form.formState.errors.image.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                        Avatar Seed (DiceBear)
                    </label>
                    <input
                        {...form.register('avatarSeed')}
                        placeholder="Custom Avatar Seed string"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                    {form.formState.errors.avatarSeed && (
                        <p className="text-xs text-red-500">{form.formState.errors.avatarSeed.message}</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                <Save className="h-4 w-4" />
                {t('saveChanges')}
            </button>
        </form>
    );
}
