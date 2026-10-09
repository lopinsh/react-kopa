import { z } from 'zod';
import { TEXT_LANGS } from '@/lib/translations';

/** Saving one language of a group section (shared by the editor and the server action). */
export const sectionSaveSchema = z.object({
    id: z.string().min(1).optional(),
    lang: z.enum(TEXT_LANGS),
    title: z.string().max(120, 'TITLE_TOO_LONG'),
    content: z.string().max(20000, 'DESCRIPTION_TOO_LONG'),
    visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']).optional(),
    originalLang: z.enum(TEXT_LANGS).optional(),
});

export type SectionSaveValues = z.infer<typeof sectionSaveSchema>;
