import { requireAdminPage } from '@/lib/admin-access';

/**
 * The one place that decides who may read the Handbook: site admins only.
 * To make the Handbook public, make this function return without checking.
 */
export async function requireHandbookAccess(locale: string, returnPath: string): Promise<void> {
    await requireAdminPage(locale, returnPath);
}
