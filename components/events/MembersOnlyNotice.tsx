import { getTranslations } from 'next-intl/server';
import { UI } from '@/lib/constants';

/** Shown instead of a 404 when someone opens a members-only event they may not see (OD-19): one sentence, nothing about the event. The group banner above carries "Sazināties". */
export default async function MembersOnlyNotice({ heading = false }: { heading?: boolean }) {
    const t = await getTranslations('event.gate');
    // On the event address it is the page's one heading (the banner's group name is a breadcrumb there, not the <h1>).
    const Tag = heading ? 'h1' : 'div';
    return (
        <Tag data-ui={UI.notice} className="max-w-page rounded-2xl bg-surface px-5 py-4 text-body-sm text-foreground shadow-card frame">
            {t('sentence')}
        </Tag>
    );
}
