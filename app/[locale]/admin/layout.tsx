import { getMessages } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { AdminService } from '@/lib/services/admin.service';
import { HandbookService } from '@/lib/services/handbook.service';
import AdminFrame from '@/components/admin/frame/AdminFrame';
import AdminFrameProvider from '@/components/admin/frame/AdminFrameProvider';
import AdminMessagesProvider from '@/components/admin/AdminMessagesProvider';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

/** Every admin page gets the same frame (AR-68). Each page checks the role itself with requireAdminPage / requireOwnerPage (lib/admin-access.ts); this layout only decides whether to show the frame. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isAdmin = isSiteAdmin(session?.user?.role);
    const [counts, chapters, messages] = await Promise.all([
        isAdmin ? AdminService.getPendingCounts() : null,
        isAdmin ? HandbookService.listChapters() : null,
        getMessages(),
    ]);

    return (
        <AdminMessagesProvider adminMessages={isAdmin ? messages.admin : {}}>
            {counts && chapters ? (
                <AdminFrameProvider counts={counts} chapters={chapters} isOwner={isSiteOwner(session?.user?.role)}>
                    <AdminFrame>{children}</AdminFrame>
                </AdminFrameProvider>
            ) : (
                children
            )}
        </AdminMessagesProvider>
    );
}
