'use client';

import { useEffect } from 'react';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useSetAdminGroup } from '@/components/providers/AdminGroupContext';

/** Copies the current group into the root-level admin context (the panel and the shield live outside the group layout). Renders nothing; site admins only. */
export default function AdminGroupBridge() {
    const g = useGroupContext();
    const setGroup = useSetAdminGroup();
    const { id, name, href, slug } = g;
    const l1Slug = g.category.l1Slug;
    const hidden = Boolean(g.moderation.hidden);
    const canHide = !hidden && g.user.role !== 'OWNER';

    useEffect(() => {
        setGroup({ id, name, href, l1Slug, slug, hidden, canHide });
        // Soft navigation group → group mounts the next bridge before this cleanup: clear only our own.
        return () => setGroup((prev) => (prev?.id === id ? null : prev));
    }, [id, name, href, l1Slug, slug, hidden, canHide, setGroup]);

    return null;
}
