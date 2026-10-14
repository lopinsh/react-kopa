import { getTranslations } from 'next-intl/server';
import PanelBody, { PanelTitle } from './PanelBody';
import ContactButton from './ContactButton';
import PanelPicture from './PanelPicture';
import { UI } from '@/lib/constants';

/** A members-only event for an outsider (OD-19): one sentence and "Sazināties"; nothing about the event itself. */
export default async function EventGatePanel({ group }: { group: { id: string; name: string; isAcceptingMembers: boolean; canContact: boolean } }) {
    const t = await getTranslations('event.gate');
    return (
        <div data-ui={UI.eventPanel} style={{ ['--c' as string]: 'var(--foreground-muted)' }}>
            <PanelPicture image={null} l1Slug="" />
            <PanelBody>
                <PanelTitle>{t('sentence')}</PanelTitle>
                {group.canContact && <ContactButton groupId={group.id} groupName={group.name} allowJoin={group.isAcceptingMembers} />}
            </PanelBody>
        </div>
    );
}
