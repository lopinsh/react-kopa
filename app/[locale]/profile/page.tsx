import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserService } from '@/lib/services/user.service';
import GroupCard from '@/components/discovery/GroupCard';
import { getTranslations, getFormatter } from 'next-intl/server';
import { Settings, MapPin, Calendar, Users, CalendarDays, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const t = await getTranslations('profile');
    const format = await getFormatter();

    const dbUser = await UserService.getOwnProfile(session.user.id);

    if (!dbUser) {
        redirect(`/${locale}`);
    }

    const memberSince = format.dateTime(dbUser.createdAt, { year: 'numeric', month: 'long', day: 'numeric' });
    const avatarSeed = dbUser.avatarSeed || dbUser.name || dbUser.id;
    const avatarUrl = dbUser.image?.startsWith('http') || dbUser.image?.startsWith('data:')
        ? dbUser.image
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* Header Section */}
            <div className="mb-12 flex flex-col items-center md:flex-row md:items-start gap-8 bg-surface-elevated/30 p-8 rounded-[3rem] border border-border">
                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-xl relative bg-primary/10">
                    <img src={avatarUrl} alt={dbUser.name || 'Avatar'} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                {dbUser.name || 'Anonymous User'}
                            </h1>
                            {dbUser.username && (
                                <p className="text-primary font-bold mt-1 text-lg">
                                    {t('handle', { username: dbUser.username })}
                                </p>
                            )}
                        </div>
                        <Link
                            href="/profile/edit"
                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <Settings className="h-4 w-4" />
                            {t('editTitle')}
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-foreground-muted font-medium">
                        {dbUser.cities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                {dbUser.cities.join(', ')}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary/70" />
                            {t('memberSince', { date: memberSince })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
                <div className="space-y-12">
                    {/* Bio Section */}
                    <section>
                        <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {t('edit.bio')}
                        </h2>

                        <div className="rounded-3xl border border-border bg-surface p-6">
                            {dbUser.bio ? (
                                <div className="prose prose-sm md:prose-base prose-p:text-foreground-muted max-w-none whitespace-pre-wrap">
                                    {dbUser.bio}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-foreground-muted italic mb-4">{t('noBio')}</p>
                                    <Link
                                        href="/profile/edit"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('editTitle')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* My Groups Preview */}
                    <section>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-secondary" />
                                {/* Reuse nav translation since in previous versions it mapped to My Groups */}
                                {t('myGroups')}
                            </h2>
                            <Link
                                href="/profile/my-groups"
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                {t('viewAllGroups')}
                            </Link>
                        </div>

                        {dbUser.recentGroups.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {dbUser.recentGroups.map((group) => (
                                    <GroupCard key={group.id} group={group} accentColor={group.accentColor} locale={locale} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-border py-12 text-center bg-surface">
                                <Users className="mx-auto mb-3 h-8 w-8 text-foreground-muted opacity-20" />
                                <p className="text-sm text-foreground-muted italic">{t('noJoinedGroups')}</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-surface-elevated/50 p-6 border border-border/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground-muted mb-6">
                            Stats
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-foreground">{dbUser._count.memberships}</p>
                                    <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">{t('stats.groupsJoined')}</p>
                                </div>
                            </div>

                            <div className="my-4 h-px bg-border/50" />

                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                                    <CalendarDays className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-foreground">{dbUser._count.attendances}</p>
                                    <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">{t('stats.eventsAttended')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
