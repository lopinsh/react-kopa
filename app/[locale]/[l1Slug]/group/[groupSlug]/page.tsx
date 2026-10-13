import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { sanitizeRichText } from '@/lib/sanitize';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import GroupPartTabs from '@/components/groups/frame/GroupPartTabs';
import GroupSocialLinks from '@/components/groups/GroupSocialLinks';
import NextMeetingBox from '@/components/groups/NextMeetingBox';
import { langAttr } from '@/lib/translations';

type Params = { locale: string; groupSlug: string; l1Slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    return group ? { title: group.name } : {};
}

/** Informācija (AR-50): the group's parts as tabs, one shown; then the next meeting and the links. Members-only parts are not in the list for visitors. */
export default async function GroupPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ part?: string }> }) {
    const { locale, groupSlug, l1Slug } = await params;
    const { part } = await searchParams;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    if (!group) notFound();

    const [t, tFrame, tCommon] = await Promise.all([
        getTranslations('group'),
        getTranslations('group.frame'),
        getTranslations('common'),
    ]);
    const base = `/${l1Slug}/group/${group.slug}`;
    const open = group.sections.find((s) => s.id === part) ?? group.sections[0];
    const items = group.sections.map((s, i) => ({
        key: s.id,
        label: i === 0 ? tCommon('about') : s.title,
        lang: i === 0 ? undefined : langAttr(s.titleLang, locale),
        href: i === 0 ? base : `${base}?part=${s.id}`,
    }));
    const contentLang = open ? langAttr(open.contentLang, locale) : undefined;

    return (
        <>
            <GroupPartTabs title={t('pages.info')} label={tFrame('partsLabel')} items={items} active={open?.id ?? ''} />
            {open && (
                <article className="max-w-[760px] rounded-2xl bg-surface px-[18px] py-3.5 text-[15px]">
                    {contentLang && <FallbackLangLabel lang={contentLang} className="mb-3" />}
                    <div lang={contentLang} className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(open.content) }} />
                </article>
            )}
            <NextMeetingBox groupId={group.id} groupHref={base} viewerId={session?.user?.id} />
            <GroupSocialLinks websiteLink={group.socialLinks.website} instagramLink={group.socialLinks.instagram} discordLink={group.socialLinks.discord} />
        </>
    );
}
