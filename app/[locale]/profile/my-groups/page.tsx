import { auth } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';
import { getTranslations } from 'next-intl/server';
import { Users, LogIn, Compass } from 'lucide-react';
import { Link } from '@/i18n/routing';
import MyGroupsListRow from '@/components/profile/MyGroupsListRow';

export default async function MyGroupsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const session = await auth();
    const tNav = await getTranslations('nav');
    const tAuth = await getTranslations('auth');
    const tProfile = await getTranslations('profile');

    // Guest view — show sign-in prompt
    if (!session?.user?.id) {
        return (
            <div className="container mx-auto px-4 py-12 min-h-full">
                <h1 className="text-4xl font-black tracking-tight text-foreground mb-8 text-center md:text-left flex items-center md:justify-start justify-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    {tNav('myGroups')}
                </h1>

                <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-24 text-center mt-12 bg-surface">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <LogIn className="h-10 w-10" />
                    </div>
                    <h2 className="mt-8 text-2xl font-black text-foreground">
                        {tAuth('signInToSeeGroups')}
                    </h2>
                    <p className="mt-2 text-foreground-muted max-w-sm mx-auto">
                        {tAuth('modalDesc')}
                    </p>
                    <Link
                        href="/api/auth/signin"
                        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        <LogIn className="h-4 w-4" />
                        {tAuth('signInButton')}
                    </Link>
                </div>
            </div>
        );
    }

    const formattedGroups = await UserService.getMyGroups(session.user.id, locale);

    const ownerGroups = formattedGroups.filter(g => g.role === 'OWNER');
    const adminGroups = formattedGroups.filter(g => g.role === 'ADMIN');
    const memberGroups = formattedGroups.filter(g => g.role === 'MEMBER');
    const pendingGroups = formattedGroups.filter(g => g.role === 'PENDING');

    return (
        <div className="container mx-auto px-4 py-12 min-h-full max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-8 text-center md:text-left flex items-center md:justify-start justify-center gap-3">
                <Users className="h-8 w-8 text-[var(--accent)]" style={{ '--accent': 'var(--color-primary)' } as any} />
                {tNav('myGroups')}
            </h1>

            {formattedGroups.length > 0 ? (
                <div className="flex flex-col gap-10">
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
                <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-24 text-center mt-12 bg-surface">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-elevated text-foreground-muted opacity-20">
                        <Users className="h-10 w-10" />
                    </div>
                    <h2 className="mt-8 text-2xl font-black text-foreground">
                        {tProfile('empty')}
                    </h2>
                    <Link
                        href="/discover"
                        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        <Compass className="h-4 w-4" />
                        {tProfile('discover')}
                    </Link>
                </div>
            )}
        </div>
    );
}
