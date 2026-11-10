import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import AdminSidebarLayout from '@/components/admin/frame/AdminSidebarLayout';
import type { HandbookHeading } from '@/lib/services/handbook.service';

interface Props {
    headings: HandbookHeading[];
    children: ReactNode;
    /** The UI-elements page needs more than a reading column. */
    wide?: boolean;
}

/** One reading column inside the page sidebar (AF-12): the chapters on top, this chapter's headings under them (AF-13). */
export default async function HandbookShell({ headings, children, wide = false }: Props) {
    const t = await getTranslations('admin.handbook');
    const tn = await getTranslations('admin.nav');
    const sections = wide ? [] : headings.map((h) => ({ id: h.id, label: h.text }));
    return (
        <AdminSidebarLayout sections={sections} labels={{ tabs: tn('pageTabs'), sections: tn('pageSections') }}>
            <article className={wide ? 'min-w-0' : 'min-w-0 max-w-reading'}>
                {children}
                {!wide && <p className="mt-12 border-t border-border pt-4 text-meta text-foreground-muted">{t('note')}</p>}
            </article>
        </AdminSidebarLayout>
    );
}
