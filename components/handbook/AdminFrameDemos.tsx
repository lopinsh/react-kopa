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
                        <span className={clsx('flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-body-sm', s.id === 'site' ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted')}>
                            {t(`sections.${s.id}`)}
                            <AdminBadge count={BADGES[s.id]} danger={s.id === 'moderation'} />
                        </span>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/** Static pages: the row under the sections bar (Design open); `drawer` shows the list with its parts indented in the phone drawer's frame. */
export function AdminPagesDemo({ drawer = false }: { drawer?: boolean }) {
    const t = useTranslations('admin.nav');
    const list = (
        <nav aria-label={t('pagesLabel')} className="flex flex-col gap-0.5">
            {DESIGN.items.map((item) => {
                const open = item.id === 'design';
                const Icon = item.icon;
                return (
                    <div key={item.id}>
                        <span className={clsx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-sm', open ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted')}>
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            {t(item.id)}
                            {item.id === 'translations' && <AdminBadge count={2} />}
                        </span>
                        {open && (
                            <ul className="my-0.5 ml-5 space-y-0.5 border-l border-border pl-2">
                                {(item.parts ?? []).map((p, i) => (
                                    <li key={p} className={clsx('rounded-lg px-3 py-1.5 text-body-sm', i === 0 ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted')}>{t(`parts.${p}`)}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );
    if (!drawer) {
        return (
            <nav aria-label={t('pagesLabel')} className="border-b border-border">
                <ul className="flex gap-1 overflow-x-auto">
                    {DESIGN.items.map((item) => {
                        const Icon = item.icon;
                        const open = item.id === 'design';
                        return (
                            <li key={item.id}>
                                <span className={clsx('flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-body-sm', open ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted')}>
                                    <Icon className="size-4" aria-hidden="true" />
                                    {t(item.id)}
                                    {item.id === 'translations' && <AdminBadge count={2} />}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }
    return (
        <div className="mx-auto max-w-xs rounded-2xl line bg-surface p-3 shadow-card">
            <p className="px-3 pb-2 text-item text-foreground">{t('drawerTitle')}</p>
            {list}
        </div>
    );
}

const SIDEBAR_ROW = 'flex min-h-11 items-center rounded-item px-3 py-2 text-body-sm';
const CHIP = 'inline-flex h-5 items-center gap-1 rounded-pill px-2 text-tag';

/** Static page sidebar: two tabs, three sections with the three status chips, the second one current. */
export function AdminSidebarDemo() {
    const t = useTranslations('admin.nav');
    const ts = useTranslations('admin.development.status');
    const rows = [
        { id: 'a', label: 'Mezgli', chip: 'approved', date: '10. nov.' },
        { id: 'b', label: 'Kanāla lapa', chip: 'progress', date: '10. nov.' },
        { id: 'c', label: 'Istaba', chip: 'open', date: '9. nov.' },
    ] as const;
    return (
        <aside className="w-aside max-w-full border-r border-border bg-background p-3">
            <div className="flex flex-col gap-0.5">
                <span className={clsx(SIDEBAR_ROW, 'bg-tint weight-strong text-foreground')}>{t('parts.looks')}</span>
                <span className={clsx(SIDEBAR_ROW, 'text-foreground-muted')}>{t('parts.colours')}</span>
            </div>
            <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-3">
                {rows.map((r, i) => (
                    <span key={r.id} className={clsx(SIDEBAR_ROW, 'flex-col items-start gap-1', i === 1 ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted')}>
                        {r.label}
                        <span className="flex items-center gap-2 text-meta text-foreground-muted">
                            <span className={clsx(CHIP, r.chip === 'open' ? 'line text-foreground' : 'bg-tint', r.chip === 'progress' ? 'text-foreground-muted' : 'text-foreground')}>{ts(r.chip)}</span>
                            v13 {r.date}
                        </span>
                    </span>
                ))}
            </div>
        </aside>
    );
}
