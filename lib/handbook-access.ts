import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';

/**
 * The one place that decides who may read the Handbook: site admins only.
 * To make the Handbook public, make this function return without checking.
 */
export async function requireHandbookAccess(locale: string, returnPath: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, returnPath));
    if (session.user.role !== 'ADMIN') notFound();
}
