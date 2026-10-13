import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { UI } from '@/lib/constants';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING';

/** A member's role as a small tag (AR-09): Owner, Mod, Pending. A plain member gets none. */
export default function RoleTag({ role }: { role: Role }) {
    const t = useTranslations('common.tag');
    if (role === 'MEMBER') return null;
    return (
        <span data-ui={UI.roleTag} className="inline-flex">
            {role === 'OWNER' && <Badge>{t('owner')}</Badge>}
            {role === 'ADMIN' && <Badge>{t('mod')}</Badge>}
            {role === 'PENDING' && <Badge tone="outline">{t('pending')}</Badge>}
        </span>
    );
}
