import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import GroupTabs from '@/components/groups/GroupTabs';
import MemberAvatarList from '@/components/groups/MemberAvatarList';
import { Info, Calendar, MessageSquare, Users as UsersIcon, HelpCircle, Lock } from 'lucide-react';
import GroupSocialLinks from '@/components/groups/GroupSocialLinks';
import GroupHeader from '@/components/groups/GroupHeader';
import { ensureContrast } from '@/lib/color-utils';
import { clsx } from 'clsx';
import { getSmartImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

export default async function GroupPage({
    params
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    const t = await getTranslations('group');

    if (!group) {
        notFound();
    }

    const { accentColor } = group;
    const pendingMembers = group.members.filter((m: any) => m.role === 'PENDING');
    const pendingCount = pendingMembers.length;

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Decorative background glows */}
            <div
                className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
                style={{ backgroundColor: accentColor }}
            />
            <div
                className="absolute top-[40%] -left-40 h-[400px] w-[400px] rounded-full opacity-[0.02] blur-[100px] pointer-events-none"
                style={{ backgroundColor: accentColor }}
            />

            {/* Identity Bar */}
            <GroupTabs
                group={group}
                l1Slug={l1Slug}
                pendingCount={pendingCount}
            />

            {/* Content Container (Reduced top padding for flush feel) */}
            <div className="px-4 md:px-8 pt-6 pb-10 max-w-screen-2xl mx-auto">
                {/* About Section with Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10 pb-24">
                        <div className="space-y-10">
                            {group.sections.map((section: any, index: number) => {
                                const isPublic = section.visibility === 'PUBLIC';
                                const isVisible = isPublic || group.isMember;

                                return (
                                    <section
                                        key={section.id}
                                        id={index === 0 ? 'about' : section.id}
                                        className="scroll-mt-[5.5rem] relative overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition-all hover:border-border/80"
                                    >
                                        {/* Content Header (Hidden for first section since Description tab is active) */}
                                        {index !== 0 && (
                                            <div className="p-8 pb-0">
                                                <div className="flex items-center gap-2.5 mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--accent)] opacity-90">
                                                    <span className="p-1.5 rounded-lg bg-[var(--accent)]/10">
                                                        <HelpCircle className="h-3.5 w-3.5" />
                                                    </span>
                                                    {section.title}
                                                </div>
                                            </div>
                                        )}

                                        {/* Primary Section Content / Guard */}
                                        <div className={clsx("p-8 pb-10", index === 0 ? "pt-8" : "pt-0")}>


                                            {!isVisible ? (
                                                <div className="py-6 text-center space-y-4">
                                                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
                                                        <Lock className="h-6 w-6 text-[var(--accent)]" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold">{t('membersOnlySection')}</h3>
                                                        <p className="text-sm text-foreground-muted">{t('membersOnlySectionDescription')}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div
                                                        className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed font-medium"
                                                        dangerouslySetInnerHTML={{ __html: section.content }}
                                                    />


                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:sticky lg:top-[5.5rem] self-start space-y-8">
                        {group.bannerImage && (
                            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
                                <Image
                                    src={getSmartImageUrl(group.bannerImage)}
                                    alt={group.name}
                                    width={600}
                                    height={337}
                                    priority
                                    unoptimized
                                    className="w-full aspect-video object-cover"
                                />
                            </div>
                        )}
                        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                            {/* 3. Member Information Section */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-foreground opacity-90">
                                    <span className="p-1.5 rounded-lg bg-[var(--accent)]/10">
                                        <UsersIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                                    </span>
                                    {t('membersTitle')}
                                </div>
                                <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/20">
                                    {group.memberCount}
                                </span>
                            </div>
                            <MemberAvatarList
                                members={group.members.filter(m => m.role !== 'PENDING')}
                                accentColor={accentColor}
                                groupId={group.id}
                                groupName={group.name}
                                isMember={group.isMember}
                            />

                            {/* Social Links */}
                            <div className="mt-8 pt-8 border-t border-border/50">
                                <GroupSocialLinks
                                    discordLink={group.discordLink}
                                    websiteLink={group.websiteLink}
                                    instagramLink={group.instagramLink}
                                    accentColor={accentColor}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
