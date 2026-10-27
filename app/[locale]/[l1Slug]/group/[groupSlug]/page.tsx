import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { sanitizeRichText } from '@/lib/sanitize';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import InfoSections from '@/components/groups/frame/InfoSections';
import NextMeetingBox from '@/components/groups/NextMeetingBox';
import { langAttr } from '@/lib/translations';

type Params = { locale: string; groupSlug: string; l1Slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    return group ? { title: group.name } : {};
}

/** Informācija (AR-50): the group's parts stacked on one page, the tabs jump to them; then the next meeting and the links. Members-only parts are not in the list for visitors. */
export default async function GroupPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ part?: string }> }) {
    const { locale, groupSlug, l1Slug } = await params;
    const { part } = await searchParams;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    if (!group) notFound();

    const [tFrame, tCommon] = await Promise.all([
        getTranslations('group.frame'),
        getTranslations('common'),
    ]);
    const open = group.sections.find((s) => s.id === part);
    const parts = group.sections.map((s, i) => {
        const contentLang = langAttr(s.contentLang, locale);
        return {
            key: s.id,
            label: i === 0 ? tCommon('about') : s.title,
            lang: i === 0 ? undefined : langAttr(s.titleLang, locale),
            content: (
                <article className="max-w-reading text-body-sm">
                    {contentLang && <FallbackLangLabel lang={contentLang} className="mb-3" />}
                    <div lang={contentLang} className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(s.content) }} />
                </article>
            ),
        };
    });
    return (
        <>
            <InfoSections label={tFrame('partsLabel')} parts={parts} initial={open?.id ?? ''} afterFirst={<div className="lg:hidden"><NextMeetingBox groupId={group.id} groupHref={`/${l1Slug}/group/${group.slug}`} viewerId={session?.user?.id} /></div>} />
        </>
    );
}
