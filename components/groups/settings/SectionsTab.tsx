'use client';

import { useTranslations } from 'next-intl';
import SectionsEditor from './sections/SectionsEditor';
import SettingsSection from './SettingsSection';
import type { EditableSection } from '@/lib/services/group.service';

type Props = {
    groupId: string;
    sections: EditableSection[];
    locale: string;
};

export default function SectionsTab({ groupId, sections, locale }: Props) {
    const gs = useTranslations('groupSettings');
    const c_common = useTranslations('common');

    return (
        <SettingsSection title={gs('tabSections')} description={c_common('tabSectionsDescription')}>
            <SectionsEditor groupId={groupId} initialSections={sections} locale={locale} />
        </SettingsSection>
    );
}
