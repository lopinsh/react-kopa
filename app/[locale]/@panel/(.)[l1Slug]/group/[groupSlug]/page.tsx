import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { GroupService } from '@/lib/services/group.service';
import { wantsFullPage } from '@/lib/panel-routes';
import GroupPanel from '@/components/panels/GroupPanel';
import PanelGone from '@/components/panels/PanelGone';
import FullPageInstead from '@/components/panels/FullPageInstead';

type Props = { params: Promise<{ locale: string; l1Slug: string; groupSlug: string }> };

/** The opened group card (AR-44) over the page you are on. One service call; a missing or hidden group says one sentence, never a 404. */
export default async function GroupPanelPage({ params }: Props) {
    const { locale, l1Slug, groupSlug } = await params;
    if (wantsFullPage((await headers()).get('next-url'), { locale, l1Slug, groupSlug })) return <FullPageInstead />;
    const session = await auth();
    const data = await GroupService.getGroupPanel(groupSlug, l1Slug, locale, session?.user?.id);
    return data ? <GroupPanel data={data} /> : <PanelGone kind="group" />;
}
