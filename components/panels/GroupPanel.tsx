import { CalendarDays } from 'lucide-react';
import { getLocale, getTimeZone, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import CategoryLine from '@/components/ui/CategoryLine';
import { buttonClass } from '@/components/ui/Button';
import { PendingStateView } from '@/components/groups/contact/PendingState';
import { cityLabel } from '@/lib/city-label';
import { capitalizeFirst, createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { langAttr } from '@/lib/translations';
import { UI } from '@/lib/constants';
import type { GroupPanelData } from '@/lib/services/group-panel';
import PanelPicture from './PanelPicture';
import PanelBody, { PANEL_LINK, PanelTitle } from './PanelBody';
import ContactButton from './ContactButton';
import FullPageLink from './FullPageLink';

/** The opened group card (AR-44): picture, name, category line, place and members, the next meeting, the first words, and the one step. */
export default async function GroupPanel({ data }: { data: GroupPanelData }) {
    const locale = await getLocale();
    const t = await getTranslations('discovery');
    const tCities = await getTranslations('cities');
    const formatter = createDateFormatter(locale, await getTimeZone());
    const base = `/${data.l1Slug}/group/${data.slug}`;
    const { viewer, nextMeeting } = data;
    const pageLink = <FullPageLink path={base} className={viewer.isMember ? buttonClass('primary', 'w-full') : `justify-self-center ${PANEL_LINK}`}>{t('panel.openPage')}</FullPageLink>;

    return (
        <div data-ui={UI.groupPanel} style={{ ['--c' as string]: data.category.color }}>
            <PanelPicture image={data.image} l1Slug={data.l1Slug} />
            <PanelBody>
                <PanelTitle>{data.name}</PanelTitle>
                <CategoryLine color={data.category.color} category={data.category.l1Title} subCategories={data.category.subCategories} />
                <p className="text-sm text-foreground-muted">{cityLabel(tCities, data.city)} · {t('memberCount', { count: data.memberCount })}</p>
                {nextMeeting && (
                    <Link href={`${base}/events/${nextMeeting.slug}`} scroll={false} className="flex items-start gap-1.5 text-sm italic text-primary hover:underline">
                        <CalendarDays aria-hidden="true" className="mt-[3px] size-4 shrink-0" />
                        <span>{t('nextMeeting', { date: capitalizeFirst(formatter.dateTime(nextMeeting.startDate, EVENT_DAY_TIME)) })}</span>
                    </Link>
                )}
                {data.text && <p lang={langAttr(data.textLang, locale)} className="text-sm leading-relaxed text-foreground">{data.text}</p>}
                {viewer.canContact && <ContactButton groupId={data.id} groupName={data.name} allowJoin={viewer.isAcceptingMembers} />}
                {viewer.pending && <PendingStateView chatId={viewer.pending.chatId} onImage={false} variant="panel" />}
                {pageLink}
            </PanelBody>
        </div>
    );
}
