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


export default async function ProfileEditPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(signInUrl(locale, '/profile/edit'));
    }

    const user = await UserService.getUserProfile(session.user.id);

    if (!user) {
        redirect(`/${locale}`);
    }

    const t = await getTranslations('profile');

    return (
        <div className="max-w-2xl">
            <div>
                <Link
                    href="/profile"
                    className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground-muted transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {t('backToProfile')}
                </Link>

                <div className="mb-6">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                        {t('editTitle')}
                    </h1>
                    <p className="mt-2 text-foreground-muted">
                        {t('editDesc')}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 md:p-8">
                    <ProfileEditForm user={user} />
                </div>
            </div>
        </div>
    );
}
