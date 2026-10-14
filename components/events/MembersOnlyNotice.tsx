import { getTranslations } from 'next-intl/server';
import { UI } from '@/lib/constants';

/** Shown instead of a 404 when someone opens a members-only event they may not see (OD-19): one sentence, nothing about the event. The group banner above carries "Sazināties". */
export default async function MembersOnlyNotice() {
    const t = await getTranslations('event.gate');
    return (
        <div data-ui={UI.notice} className="max-w-[760px] rounded-2xl bg-surface px-[18px] py-3.5 text-[15px] text-foreground">
            {t('sentence')}
        </div>
    );
}
