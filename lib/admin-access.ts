import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

export interface AdminPageAccess {
    userId: string;
    isOwner: boolean;
}

/**
 * The one guard for site-admin pages: signed out goes to sign-in (and back), signed in without the
 * role gets a 404 so the page does not reveal itself. `returnPath` has no locale prefix.
 */
export async function requireAdminPage(locale: string, returnPath: string): Promise<AdminPageAccess> {
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, returnPath));
    if (!isSiteAdmin(session.user.role)) notFound();
    return { userId: session.user.id, isOwner: isSiteOwner(session.user.role) };
}

/** Same as requireAdminPage, for pages only the site owner may open. */
export async function requireOwnerPage(locale: string, returnPath: string): Promise<AdminPageAccess> {
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, returnPath));
    if (!isSiteOwner(session.user.role)) notFound();
    return { userId: session.user.id, isOwner: true };
}
