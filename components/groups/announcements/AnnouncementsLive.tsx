'use client';

import { useRouter } from 'next/navigation';
import { usePusher } from '@/hooks/usePusher';

/** Keeps the page current: the group channel carries ids only, so any change just asks the server for the page again. */
export default function AnnouncementsLive({ groupId }: { groupId: string }) {
    const router = useRouter();
    const refresh = () => router.refresh();
    usePusher<{ id: string }>(`group-${groupId}`, 'new-post', refresh);
    usePusher<{ id: string }>(`group-${groupId}`, 'archive-post', refresh);
    usePusher<{ postId: string }>(`group-${groupId}`, 'delete-post', refresh);
    return null;
}
