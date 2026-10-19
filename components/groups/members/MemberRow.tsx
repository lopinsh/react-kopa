import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import RoleTag from '@/components/ui/RoleTag';
import MemberRowMenu from '@/components/groups/members/MemberRowMenu';
import type { MemberRowData } from '@/lib/services/group-members';
import { UI } from '@/lib/constants';

type Props = { member: MemberRowData; groupId: string };

/** One member in the list (AR-53): face, name, "since month year", role tag, and the "…" menu when there is anything to do. */
export default async function MemberRow({ member, groupId }: Props) {
    const t = await getTranslations('group');
    const format = await getFormatter();
    const name = member.name || t('anonymousUser');
    return (
        <li data-ui={UI.memberCard} className="flex items-center gap-3 py-3">
            <img src={member.avatar} alt="" className="size-11 shrink-0 rounded-full border border-border bg-surface object-cover" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    {member.profileHref ? (
                        <Link href={member.profileHref} className="truncate font-semibold text-foreground hover:text-primary">{name}</Link>
                    ) : (
                        <span className="truncate font-semibold text-foreground">{name}</span>
                    )}
                    <RoleTag role={member.role} />
                </div>
                <p className="text-[13px] text-foreground-muted">{t('members.since', { date: format.dateTime(member.since, { month: 'long', year: 'numeric' }) })}</p>
            </div>
            {member.actions.length > 0 && (
                <MemberRowMenu groupId={groupId} userId={member.userId} name={name} actions={member.actions} profileHref={member.profileHref} />
            )}
        </li>
    );
}
