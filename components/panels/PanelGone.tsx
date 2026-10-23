import { CloudOff } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import EmptyState from '@/components/ui/EmptyState';
import PanelPicture from './PanelPicture';
import { PANEL_TITLE_ID } from '@/lib/constants';

/** An event that is hidden, deleted or never existed: one sentence in the panel, nothing about it (the panel never calls notFound). */
export default async function PanelGone() {
    const sentence = (await getTranslations('event'))('panel.gone');
    return (
        <div style={{ ['--c' as string]: 'var(--foreground-muted)' }}>
            <PanelPicture image={null} l1Slug="" />
            <EmptyState icon={CloudOff} title={sentence} />
            <span id={PANEL_TITLE_ID} tabIndex={-1} className="sr-only">{sentence}</span>
        </div>
    );
}
