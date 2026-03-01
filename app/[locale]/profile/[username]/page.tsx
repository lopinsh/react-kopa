import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { UserService } from '@/lib/services/user.service';
import GroupCard from '@/components/discovery/GroupCard';
import { getTranslations, getFormatter } from 'next-intl/server';
import { MapPin, Calendar, MessageSquare, Info, Users, ShieldAlert } from 'lucide-react';

export default async function PublicProfilePage({
    params
}: {
    params: Promise<{ locale: string; username: string }>
}) {
    const { locale, username } = await params;
    const session = await auth();
    const t = await getTranslations('profile');
    const format = await getFormatter();

    const dbUser = await UserService.getUserByUsername(username, session?.user?.id);

    if (!dbUser) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === dbUser.id;

    // Privacy check
    if (!dbUser.isProfilePublic && !isOwnProfile) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
                <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-24 bg-surface">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-elevated text-foreground-muted opacity-50 mb-6">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground mb-4">{t('privateProfile')}</h1>
                    <p className="text-foreground-muted">
                        {t('privateProfileDesc')}
                    </p>
                </div>
            </div>
        );
    }

    const memberSince = format.dateTime(dbUser.createdAt, { year: 'numeric', month: 'long', day: 'numeric' });
    const avatarSeed = dbUser.avatarSeed || dbUser.name || dbUser.id;
    const avatarUrl = dbUser.image?.startsWith('http') || dbUser.image?.startsWith('data:')
        ? dbUser.image
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {isOwnProfile && (
                <div className="mb-8 rounded-2xl bg-primary/10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-primary" />
                        <p className="text-sm font-bold text-primary">{t('viewingOwnPublicProfile')}</p>
                    </div>
                    <a href="/profile/edit" className="text-sm font-bold text-primary hover:underline">
                        {t('editTitle')}
                    </a>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-12 flex flex-col items-center md:flex-row md:items-start gap-8 bg-surface-elevated/30 p-8 rounded-[3rem] border border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/10 opacity-50" />

                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-xl relative z-10 bg-primary/10">
                    <img src={avatarUrl} alt={dbUser.name || 'Avatar'} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 text-center md:text-left relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                {dbUser.name || 'Anonymous User'}
                            </h1>
                            <p className="text-primary font-bold mt-1 text-lg">
                                {t('handle', { username: dbUser.username || '' })}
                            </p>
                        </div>

                        {!isOwnProfile && (
                            <button
                                disabled
                                className="group relative flex h-11 items-center justify-center gap-2 rounded-xl bg-surface-elevated px-6 text-sm font-bold text-foreground-muted border border-border transition-all w-full md:w-auto overflow-visible cursor-not-allowed"
                            >
                                <MessageSquare className="h-4 w-4" />
                                {t('message')}

                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-foreground text-background text-xs font-bold px-3 py-2 rounded-lg pointer-events-none">
                                    {dbUser.allowDirectMessages ? t('messagingComingSoon') : t('messagingDisabled')}
                                </div>
                            </button>
                        )}
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

            <div className="space-y-12">
                {/* Bio Section */}
                {dbUser.bio && (
                    <section className="max-w-2xl">
                        <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {t('edit.bio')}
                        </h2>
                        <div className="rounded-3xl border border-border bg-surface p-6">
                            <div className="prose prose-sm md:prose-base prose-p:text-foreground-muted max-w-none whitespace-pre-wrap">
                                {dbUser.bio}
                            </div>
                        </div>
                    </section>
                )}

                {/* Visible Groups */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-secondary" />
                            {t('sharedGroups')}
                        </h2>
                    </div>

                    {dbUser.publicGroups.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {dbUser.publicGroups.map((group) => (
                                <GroupCard key={group.id} group={group} accentColor={group.accentColor} locale={locale} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-border py-12 text-center bg-surface">
                            <Users className="mx-auto mb-3 h-8 w-8 text-foreground-muted opacity-20" />
                            <p className="text-sm text-foreground-muted italic">{t('noSharedGroups')}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
