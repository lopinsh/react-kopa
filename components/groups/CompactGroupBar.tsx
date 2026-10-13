'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import RoleTag from '@/components/ui/RoleTag';
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
                        className="block truncate text-lg font-semibold leading-tight tracking-tight text-foreground hover:text-primary"
                    >
                        {group.name}
                    </Link>
                    <p className="truncate text-xs text-foreground-muted">
                        {group.city && <>{cityLabel(tCities, group.city)}{' · '}</>}
                        {t.rich('membersCount', { count: group.stats.memberCount, b: (chunks) => <span>{chunks}</span> })}
                    </p>
                </div>
                {user.isMember && (
                    <RoleTag role={isOwner ? 'OWNER' : user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'} />
                )}
            </div>
        </div>
    );
}
