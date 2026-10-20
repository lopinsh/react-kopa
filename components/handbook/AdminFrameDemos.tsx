import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import AdminBadge from '@/components/admin/frame/AdminBadge';
import { ADMIN_NAV } from '@/lib/constants/adminNav';

const DESIGN = ADMIN_NAV.find((s) => s.id === 'site')!;
const BADGES = { moderation: 3, structure: 2, site: 1, team: 0, development: 0 } as const;

/** Static copy of the sections bar: Site open. Same classes as `AdminSections`, nothing is a link. */
export function AdminSectionsDemo() {
    const t = useTranslations('admin.nav');
    return (
        <nav aria-label={t('sectionsLabel')} className="border-b border-border bg-background">
            <ul className="flex gap-1 overflow-x-auto">
                {ADMIN_NAV.map((s) => (
                    <li key={s.id}>
                        <span className={clsx('flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm', s.id === 'site' ? 'border-primary font-semibold text-foreground' : 'border-transparent text-foreground-muted')}>
                            {t(`sections.${s.id}`)}
                            <AdminBadge count={BADGES[s.id]} danger={s.id === 'moderation'} />
                        </span>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/** Static pages list (Design open, its parts indented); `drawer` shows it in the phone drawer's frame. */
export function AdminPagesDemo({ drawer = false }: { drawer?: boolean }) {
    const t = useTranslations('admin.nav');
    const list = (
        <nav aria-label={t('pagesLabel')} className="flex flex-col gap-0.5">
            {DESIGN.items.map((item) => {
                const open = item.id === 'design';
                const Icon = item.icon;
                return (
                    <div key={item.id}>
                        <span className={clsx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm', open ? 'bg-tint font-semibold text-foreground' : 'text-foreground-muted')}>
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            {t(item.id)}
                            {item.id === 'translations' && <AdminBadge count={2} />}
                        </span>
                        {open && (
                            <ul className="my-0.5 ml-5 space-y-0.5 border-l border-border pl-2">
                                {(item.parts ?? []).map((p, i) => (
                                    <li key={p} className={clsx('rounded-lg px-2.5 py-1.5 text-sm', i === 0 ? 'bg-tint font-semibold text-foreground' : 'text-foreground-muted')}>{t(`parts.${p}`)}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );
    if (!drawer) return <div className="max-w-64">{list}</div>;
    return (
        <div className="mx-auto max-w-xs rounded-2xl border border-border bg-surface p-3">
            <p className="px-3 pb-2 font-serif text-base font-semibold text-foreground">{t('drawerTitle')}</p>
            {list}
        </div>
    );
}
