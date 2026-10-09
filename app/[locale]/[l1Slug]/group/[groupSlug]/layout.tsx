import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import GroupHeader from '@/components/groups/GroupHeader';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import GroupTabs from '@/components/groups/GroupTabs';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { ensureContrast, getContrastForeground } from '@/lib/color-utils';

export default async function GroupLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    const accentColor = ensureContrast(group.theme.accentColor || group.category.color || '#3B82F6');
    const accentForeground = getContrastForeground(accentColor);

    const accentStyle = {
        '--accent': accentColor,
        '--accent-foreground': accentForeground === 'white' ? '#ffffff' : '#000000',
        '--group-accent': accentColor
    } as React.CSSProperties;

    const pendingMembers = group.members.filter((m) => m.role === 'PENDING');
    const pendingCount = pendingMembers.length;

    return (
        <GroupProvider value={{
            id: group.id,
            slug: group.slug,
            user: group.user,
            pendingCount,
            // Titles only: the client navigation needs no section text.
            sections: group.sections.map(({ id, title, titleLang, order, visibility }) => ({ id, title, titleLang, order, visibility }))
        }}>
            <div
                style={accentStyle}
                className="min-h-full bg-background"
                suppressHydrationWarning
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            --accent: ${accentColor};
                            --accent-foreground: ${accentForeground === 'white' ? '#ffffff' : '#000000'};
                            --group-accent: ${accentColor};
                        }
                    `
                }} />
                {group.moderation.hidden && (
                    <HiddenGroupBanner groupId={group.id} reason={group.moderation.hidden.reason} canRestore={group.moderation.isSiteAdmin} />
                )}
                <GroupHeader
                    group={group}
                    l1Slug={l1Slug}
                />

                <GroupTabs
                    group={group}
                    l1Slug={l1Slug}
                    pendingCount={pendingCount}
                />

                <main>
                    {children}
                </main>
            </div>
        </GroupProvider>
    );
}

