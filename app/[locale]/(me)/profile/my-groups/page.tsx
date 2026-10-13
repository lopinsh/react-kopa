import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';
import { getTranslations } from 'next-intl/server';
import { Users, LogIn, Compass } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { signInUrl } from '@/lib/auth-redirect';
import MyGroupsListRow from '@/components/profile/MyGroupsListRow';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'nav' });
    return { title: t('myGroups') };
}

export default async function MyGroupsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const session = await auth();
    const tCommon = await getTranslations('common');
    const tAuth = await getTranslations('auth');
    const tProfile = await getTranslations('profile');

    // Guest view — show sign-in prompt
    if (!session?.user?.id) {
        return (
            <div className="container mx-auto px-4 py-12 min-h-full">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-8 text-center md:text-left flex items-center md:justify-start justify-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    {tCommon('myGroups')}
                </h1>

                <EmptyState
                    icon={LogIn}
                    title={tAuth('signInToSeeGroups')}
                    description={tAuth('modalDesc')}
                    action={
                        <a href={signInUrl(locale, '/profile/my-groups')} className={buttonClass('primary')}>
                            <LogIn aria-hidden="true" />
                            {tAuth('signInButton')}
                        </a>
                    }
                />
            </div>
        );
    }

    const formattedGroups = await UserService.getMyGroups(session.user.id, locale);

    const ownerGroups = formattedGroups.filter(g => g.role === 'OWNER');
    const adminGroups = formattedGroups.filter(g => g.role === 'ADMIN');
    const memberGroups = formattedGroups.filter(g => g.role === 'MEMBER');
    const pendingGroups = formattedGroups.filter(g => g.role === 'PENDING');

    // Groups needing attention (user is admin/owner AND there are pending requests)
    const actionRequiredGroups = formattedGroups.filter(
        g => (g.role === 'OWNER' || g.role === 'ADMIN') && g.pendingCount > 0
    );

    return (
        <div className="container mx-auto px-4 py-12 min-h-full max-w-5xl">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-8 text-center md:text-left flex items-center md:justify-start justify-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                {tCommon('myGroups')}
            </h1>

            {formattedGroups.length > 0 ? (
                <div className="flex flex-col gap-10">
                    {actionRequiredGroups.length > 0 && (
                        <section className="bg-danger/10 -mx-4 px-4 py-6 rounded-3xl border border-danger/40 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h2 className="mb-4 text-xl font-bold text-danger flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                                </span>
                                {tCommon('actionRequired')}
                            </h2>
                            <div className="flex flex-col gap-3">
                                {actionRequiredGroups.map(group => (
                                    <MyGroupsListRow key={`req-${group.id}`} group={group} locale={locale} actionRequired />
                                ))}
                            </div>
                        </section>
                    )}

                    {ownerGroups.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-foreground">{tProfile('sectionOwner')}</h2>
                            <div className="flex flex-col gap-3">
                                {ownerGroups.map(group => (
                                    <MyGroupsListRow key={group.id} group={group} locale={locale} />
                                ))}
                            </div>
                        </section>
                    )}

                    {adminGroups.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-foreground">{tProfile('sectionAdmin')}</h2>
                            <div className="flex flex-col gap-3">
                                {adminGroups.map(group => (
                                    <MyGroupsListRow key={group.id} group={group} locale={locale} />
                                ))}
                            </div>
                        </section>
                    )}

                    {memberGroups.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-foreground">{tProfile('sectionMember')}</h2>
                            <div className="flex flex-col gap-3">
                                {memberGroups.map(group => (
                                    <MyGroupsListRow key={group.id} group={group} locale={locale} />
                                ))}
                            </div>
                        </section>
                    )}

                    {pendingGroups.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-foreground opacity-70">{tProfile('sectionPending')}</h2>
                            <div className="flex flex-col gap-3 opacity-80">
                                {pendingGroups.map(group => (
                                    <MyGroupsListRow key={group.id} group={group} locale={locale} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon={Users}
                    title={tProfile('empty')}
                    action={
                        <Link href="/" className={buttonClass('primary')}>
                            <Compass aria-hidden="true" />
                            {tProfile('discover')}
                        </Link>
                    }
                />
            )}
        </div>
    );
}
