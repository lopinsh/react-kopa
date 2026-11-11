export type FlatTag = {
    id: string;
    title: string;
    slug: string;
    l2Id: string;
    l2Title: string;
    level: number;
};

export type PendingTag = {
    id: string;
    title: string;
    /** 3 for a suggested sub-veids; `parentId` is then its Veids. */
    level?: 2 | 3;
    parentId?: string;
};
