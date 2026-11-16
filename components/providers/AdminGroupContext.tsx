'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/** The group page the viewer is on, as far as the admin tool panel and the shield need it. Only a site admin's group layout fills it. */
export type AdminGroupRef = {
    id: string;
    name: string;
    /** Path without locale: `/${l1Slug}/group/${slug}`. */
    href: string;
    l1Slug: string;
    slug: string;
    hidden: boolean;
    /** Not hidden and not the admin's own group. */
    canHide: boolean;
};

type Value = { group: AdminGroupRef | null; setGroup: (next: AdminGroupRef | null | ((prev: AdminGroupRef | null) => AdminGroupRef | null)) => void };

const AdminGroupContext = createContext<Value>({ group: null, setGroup: () => undefined });

export function AdminGroupProvider({ children }: { children: ReactNode }) {
    const [group, setGroup] = useState<AdminGroupRef | null>(null);
    return <AdminGroupContext.Provider value={{ group, setGroup }}>{children}</AdminGroupContext.Provider>;
}

export const useAdminGroup = (): AdminGroupRef | null => useContext(AdminGroupContext).group;
export const useSetAdminGroup = () => useContext(AdminGroupContext).setGroup;
