'use client';

import { useTranslations } from 'next-intl';
import { useAdminFrame } from './AdminFrameProvider';
import AdminSections from './AdminSections';
import AdminPagesNav, { useAdminParts } from './AdminPagesNav';
import AdminDrawer from './AdminDrawer';

function PhoneBar() {
    const t = useTranslations('admin.nav');
    const { location } = useAdminFrame();
    const parts = useAdminParts(location.item);
    const partLabel = location.part ? parts.find((p) => p.id === location.part)?.label ?? null : null;
    const title = location.item ? t(location.item.id) : location.section ? t(`sections.${location.section.id}`) : t('drawerTitle');
    return <AdminDrawer title={title} part={partLabel} />;
}

/**
 * Admin frame (AR-68): sections across (sticky), the open section's pages down the left from `lg`, the page on the right.
 * A section with one page (Komanda) has no left column and the page uses the full width; the redesign page (the owner's review page) stays full-bleed under the bars.
 */
export default function AdminFrame({ children }: { children: React.ReactNode }) {
    const { location } = useAdminFrame();
    const bleed = location.item?.id === 'redesign';
    const single = (location.section?.items.length ?? 0) <= 1;
    return (
        <>
            <AdminSections />
            <div className="container mx-auto px-4">
                <PhoneBar />
                {bleed ? null : single ? (
                    <div className="py-6">{children}</div>
                ) : (
                    <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
                        <div className="hidden lg:block lg:pt-6"><AdminPagesNav variant="side" /></div>
                        <div className="min-w-0 py-6">{children}</div>
                    </div>
                )}
            </div>
            {bleed && children}
        </>
    );
}
