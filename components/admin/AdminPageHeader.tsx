import type { ReactNode } from 'react';
import PageHead from '@/components/ui/PageHead';

type Props = { title: string; subtitle?: string; action?: ReactNode };

/** The title block of an admin page (R11b): the page title, one quiet line, an optional action at the right. */
export default function AdminPageHeader({ title, subtitle, action }: Props) {
    return <PageHead className="mb-6" title={title} lead={subtitle} actions={action} />;
}
