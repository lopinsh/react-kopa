import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { UserService } from '@/lib/services/user.service';
import GroupCard from '@/components/discovery/GroupCard';
import { getTranslations, getFormatter } from 'next-intl/server';
import { cityLabel } from '@/lib/city-label';
import { MapPin, Calendar, Info, Users, ShieldAlert } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import { MessageService } from '@/lib/services/message.service';
import MessageUserButton from '@/components/messages/MessageUserButton';
import { UI } from '@/lib/constants';

export default async function PublicProfilePage({
    params
}: {
    params: Promise<{ locale: string; username: string }>
}) {
    const { locale, username } = await params;
    const session = await auth();
    const t = await getTranslations('profile');
    const tCities = await getTranslations('cities');
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
                <div data-ui={UI.emptyState} className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-24 bg-surface">
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

    // Whether the viewer may message this person (shared group, their setting, not yourself) is decided by the service.
    const canMessage = (await MessageService.messageableUserIds(session?.user?.id, [dbUser.id])).has(dbUser.id);

    const memberSince = format.dateTime(dbUser.createdAt, { year: 'numeric', month: 'long', day: 'numeric' });
    const avatarSrc = avatarUrl(dbUser);

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {isOwnProfile && (
                <div className="mb-8 rounded-2xl bg-primary/10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-primary" />
                        <p className="text-sm font-bold text-primary">{t('viewingOwnPublicProfile')}</p>
                    </div>
                    <Link href="/profile/edit" className="text-sm font-bold text-primary hover:underline">
                        {t('editTitle')}
                    </Link>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-12 flex flex-col items-center md:flex-row md:items-start gap-8 bg-surface-elevated/30 p-8 rounded-[3rem] border border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />

                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-xl relative z-10 bg-primary/10">
                    <img src={avatarSrc} alt={dbUser.name || 'Avatar'} className="h-full w-full object-cover" />
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

                        {canMessage && <MessageUserButton userId={dbUser.id} />}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-foreground-muted font-medium">
                        {dbUser.cities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                {dbUser.cities.map((c) => cityLabel(tCities, c)).join(', ')}
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

                {/* Groups: all of them when the person opted in (or it is their own profile), otherwise only the shared ones. Logged-out visitors share none, so the section is left out. */}
                {(dbUser.showsAllGroups || session?.user?.id) && (
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-secondary" />
                            {dbUser.showsAllGroups ? t('groupsHeading') : t('sharedGroups')}
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
                            <p className="text-sm text-foreground-muted italic">{dbUser.showsAllGroups ? t('noJoinedGroups') : t('noSharedGroups')}</p>
                        </div>
                    )}
                </section>
                )}
            </div>
        </div>
    );
}
