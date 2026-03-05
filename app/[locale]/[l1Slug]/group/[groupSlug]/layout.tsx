import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import GroupHeader from '@/components/groups/GroupHeader';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { ensureContrast, getContrastForeground } from '@/lib/color-utils';

export default async function GroupLayout({
    children,
    modal,
    params,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    const accentColor = ensureContrast(group.accentColor || group.category.color || '#3B82F6');
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
            userRole: group.userRole,
            isMember: group.isMember,
            accentColor: group.accentColor,
            pendingCount,
            sections: group.sections
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
                <GroupHeader
                    group={group}
                    l1Slug={l1Slug}
                />

                <main>
                    {children}
                </main>
                {modal}
            </div>
        </GroupProvider>
    );
}

