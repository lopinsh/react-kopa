import type { ReactNode } from 'react';
import { Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/Button';
import { UI } from '@/lib/constants';
import type { MyGroupsOverview } from '@/lib/types/own-area';
import SectionMenu from './SectionMenu';
import UpcomingSection from './UpcomingSection';
import NewsSection from './NewsSection';
import YourGroupsSection from './YourGroupsSection';
import YourRequestsSection from './YourRequestsSection';

/**
 * Manas grupas (AR-61): a menu of sections and the sections under it, one page. Empty sections and their menu entries are left out;
 * with nothing at all the page is one empty state. "Tas ir viss jaunais." ends a page that has anything; nothing is suggested below it.
 */
export default async function MyGroupsSections({ overview }: { overview: MyGroupsOverview }) {
    const t = await getTranslations('profile');
    const sections: Array<{ key: string; label: string; body: ReactNode }> = [];
    if (overview.upcoming.length > 0) sections.push({ key: 'upcoming', label: t('myGroups.upcoming'), body: <UpcomingSection overview={overview} /> });
    if (overview.news.length > 0) sections.push({ key: 'news', label: t('myGroups.news'), body: <NewsSection items={overview.news} /> });
    if (overview.groups.length > 0) sections.push({ key: 'groups', label: t('myGroups.groups'), body: <YourGroupsSection groups={overview.groups} activity={overview.activity} /> });
    if (overview.requests.length > 0) sections.push({ key: 'requests', label: t('myGroups.requests'), body: <YourRequestsSection requests={overview.requests} /> });

    if (sections.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title={t('myGroups.emptyTitle')}
                description={t('myGroups.emptyText')}
                action={<Link href="/" className={buttonClass('primary')}>{t('discover')}</Link>}
            />
        );
    }
    return (
        <div data-ui={UI.myGroupsSections} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
            <SectionMenu sections={sections.map(({ key, label }) => ({ key, label }))} />
            {sections.map(({ key, label, body }) => (
                <section key={key} id={key} aria-labelledby={`${key}-title`} className="scroll-mt-10 border-t border-border pt-4 first-of-type:border-t-0 first-of-type:pt-0">
                    <h2 id={`${key}-title`} className="sr-only">{label}</h2>
                    {body}
                </section>
            ))}
            <p className="py-4 text-center text-sm text-foreground-muted">{t('myGroups.end')}</p>
        </div>
    );
}
