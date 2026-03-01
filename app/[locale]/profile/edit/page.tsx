import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { UserService } from '@/lib/services/user.service';

export default async function ProfileEditPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/${locale}/api/auth/signin`);
    }

    const user = await UserService.getUserProfile(session.user.id);

    if (!user) {
        redirect(`/${locale}`);
    }

    const t = await getTranslations('profile');

    return (
        <div className="min-h-full bg-surface-elevated/30 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link
                    href="/profile"
                    className="mb-8 flex items-center gap-2 text-sm font-bold text-foreground-muted transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Profile
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
                        {t('editTitle')}
                    </h1>
                    <p className="mt-4 text-lg text-foreground-muted">
                        {t('editDesc')}
                    </p>
                </div>

                <div className="rounded-[40px] border border-border bg-surface p-8 md:p-12 shadow-sm">
                    <ProfileEditForm user={user} />
                </div>
            </div>
        </div>
    );
}
