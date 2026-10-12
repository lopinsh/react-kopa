import { auth } from '@/lib/auth';
import { AdminService } from '@/lib/services/admin.service';
import AdminNav from '@/components/admin/AdminNav';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

/** Every admin page gets the same navigation. Each page checks the role itself with requireAdminPage / requireOwnerPage (lib/admin-access.ts); this layout only decides whether to show the nav. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isAdmin = isSiteAdmin(session?.user?.role);
    const counts = isAdmin ? await AdminService.getPendingCounts() : null;

    return (
        <>
            {counts && <AdminNav pendingTags={counts.tags} pendingReports={counts.reports} pendingSuggestions={counts.suggestions} isOwner={isSiteOwner(session?.user?.role)} />}
            {children}
        </>
    );
}
