import { getMessages } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { AdminService } from '@/lib/services/admin.service';
import AdminNav from '@/components/admin/AdminNav';
import AdminMessagesProvider from '@/components/admin/AdminMessagesProvider';
import { isSiteAdmin } from '@/lib/site-role';

/** Every admin page gets the same navigation. Each page checks the role itself with requireAdminPage / requireOwnerPage (lib/admin-access.ts); this layout only decides whether to show the nav. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isAdmin = isSiteAdmin(session?.user?.role);
    const [counts, messages] = await Promise.all([isAdmin ? AdminService.getPendingCounts() : null, getMessages()]);

    return (
        <AdminMessagesProvider adminMessages={isAdmin ? messages.admin : {}}>
            {counts && <AdminNav pendingTags={counts.tags} pendingCities={counts.cities} pendingReports={counts.reports} pendingSuggestions={counts.suggestions} />}
            {children}
        </AdminMessagesProvider>
    );
}
