import { prisma } from '@/lib/prisma';
import { isSiteAdmin } from '@/lib/site-role';

type ContactPerson = { id: string; contact: string | null; contactVisibleToAll: boolean; isProfilePublic: boolean };

/**
 * The one place that decides who sees a person's contact (R32). First match wins:
 * empty -> null; the person themself (not the `asStranger` view) -> value; private profile -> null; signed out -> null;
 * switch on -> value; site admin -> value; shares a group (both non-PENDING, group not hidden) -> value; else null.
 */
export async function contactFor(
    person: ContactPerson,
    viewerId: string | undefined,
    opts: { asStranger?: boolean } = {},
): Promise<string | null> {
    if (!person.contact) return null;
    if (viewerId === person.id && !opts.asStranger) return person.contact;
    if (!person.isProfilePublic) return null;
    if (!viewerId) return null;
    if (person.contactVisibleToAll) return person.contact;
    if (viewerId === person.id) return null; // Mans profils: the stranger view, switch off
    const viewer = await prisma.user.findUnique({ where: { id: viewerId }, select: { role: true } });
    if (isSiteAdmin(viewer?.role)) return person.contact;
    const shared = await prisma.membership.findFirst({
        where: {
            userId: person.id,
            role: { not: 'PENDING' },
            group: { hiddenAt: null, members: { some: { userId: viewerId, role: { not: 'PENDING' } } } },
        },
        select: { id: true },
    });
    return shared ? person.contact : null;
}

/**
 * The same rule for one accepted row on Biedri, without queries: the page already requires an accepted viewer,
 * so a row in a visible group is a shared group.
 */
export function contactForMemberRow(
    person: ContactPerson,
    viewerId: string | undefined,
    group: { hidden: boolean; isSiteAdmin: boolean },
): string | null {
    if (!person.contact) return null;
    if (viewerId && viewerId === person.id) return person.contact;
    if (!person.isProfilePublic || !viewerId) return null;
    return !group.hidden || person.contactVisibleToAll || group.isSiteAdmin ? person.contact : null;
}
