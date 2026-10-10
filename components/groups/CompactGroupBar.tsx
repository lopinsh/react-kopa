'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Shield, User } from 'lucide-react';
import { cityLabel } from '@/lib/city-label';
import { isOwner as checkIsOwner } from '@/lib/utils/permissions';
import { useGroupContext } from '@/components/providers/GroupProvider';
import type { GroupContext } from '@/lib/services/group.service';
import { UI } from '@/lib/constants';

type Props = {
    group: GroupContext;
    l1Slug: string;
};

/** One slim line instead of the full banner header — used on the Events tab and event pages. */
export default function CompactGroupBar({ group, l1Slug }: Props) {
    const t = useTranslations('group');
    const tCommon = useTranslations('common');
    const tCities = useTranslations('cities');
    const { user } = useGroupContext();
    const isOwner = checkIsOwner(user.role);

    return (
        <div data-ui={UI.slimBar} className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-3 md:px-8">
                <span className="h-9 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/${l1Slug}/group/${group.slug}`}
                        className="block truncate text-lg font-black leading-tight tracking-tight text-foreground hover:text-[var(--accent)]"
                    >
                        {group.name}
                    </Link>
                    <p className="truncate text-xs text-foreground-muted">
                        {cityLabel(tCities, group.city)}
                        {' · '}
                        {t.rich('membersCount', { count: group.stats.memberCount, b: (chunks) => <span>{chunks}</span> })}
                    </p>
                </div>
                {user.isMember && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-semibold text-foreground-muted">
                        {isOwner || user.role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {isOwner ? tCommon('role_owner') : user.role === 'ADMIN' ? tCommon('role_admin') : tCommon('role_member')}
                    </span>
                )}
            </div>
        </div>
    );
}
