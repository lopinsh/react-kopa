import { auth } from '@/lib/auth';
import { AdminService } from '@/lib/services/admin.service';
import AdminNav from '@/components/admin/AdminNav';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

/** Every admin page gets the same navigation. Pages still check the role themselves. */
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
