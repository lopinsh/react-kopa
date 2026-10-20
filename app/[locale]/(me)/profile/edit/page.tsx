import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { UserService } from '@/lib/services/user.service';
import { signInUrl } from '@/lib/auth-redirect';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'profile' });
    return { title: t('editTitle') };
}

/** Labot profilu: its own page inside the own frame (OD-26). The privacy switches live in Iestatījumi. */
export default async function ProfileEditPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/profile/edit'));

    const user = await UserService.getUserProfile(session.user.id);
    if (!user) redirect(`/${locale}`);

    const t = await getTranslations('profile');

    return (
        <div className="grid max-w-[560px] gap-4">
            <Link href="/profile" className="flex w-fit min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground-muted hover:text-primary md:min-h-0">
                <ChevronLeft aria-hidden className="size-4" />
                {t('backToProfile')}
            </Link>
            <h1 className="font-heading text-xl font-semibold md:sr-only">{t('editTitle')}</h1>
            <div className="rounded-2xl bg-surface px-4 py-5 md:px-5 shadow-card frame">
                <ProfileEditForm user={user} />
            </div>
        </div>
    );
}
