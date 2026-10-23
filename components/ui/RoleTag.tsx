import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { UI, type RoleToneKey } from '@/lib/constants';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING';

const TONE: Record<Role, RoleToneKey> = { OWNER: 'owner', ADMIN: 'mod', MEMBER: 'member', PENDING: 'pending' };

/**
 * A member's role as a small tag (AR-09): Owner, Mod, Pending, in the look's colour for that role (one per role, never a category tone).
 * A plain member gets none, unless `showMember` (discovery, where not every group is yours).
 * `bright` (group cards and rows, R21-G): every role the same bright green with dark text, a colour outside the palette (design.md, Colour).
 */
export default function RoleTag({ role, showMember = false, bright = false }: { role: Role; showMember?: boolean; bright?: boolean }) {
    const t = useTranslations('common.tag');
    if (role === 'MEMBER' && !showMember) return null;
    const label = { OWNER: t('owner'), ADMIN: t('mod'), MEMBER: t('member'), PENDING: t('pending') }[role];
    return (
        <span data-ui={UI.roleTag} className="inline-flex">
            {bright
                ? <Badge tone="role" className="bg-role-live text-role-live-ink">{label}</Badge>
                : <Badge tone="role" role={TONE[role]}>{label}</Badge>}
        </span>
    );
}
