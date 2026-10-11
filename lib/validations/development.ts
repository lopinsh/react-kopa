import { z } from 'zod';

/** One section of the redesign page that changed: `version` is the page version that touched it. */
export const redesignSectionSchema = z.object({
    kind: z.enum(['new', 'updated']),
    version: z.string().min(1).max(40),
});

/** `docs/development/redesign.meta.json`: bumped by whoever edits `redesign.html`. Keys of `sections` are the `<h2 id>` of a section. */
export const redesignMetaSchema = z.object({
    version: z.string().min(1).max(40),
    updated: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'ISO date expected'),
    changes: z.array(z.string().max(300)).max(30).default([]),
    sections: z.record(z.string().regex(/^[\w-]+$/), redesignSectionSchema).default({}),
});

export type RedesignMeta = z.infer<typeof redesignMetaSchema>;
