import { z } from 'zod';
import { isDefaultSectionTitle } from '@/lib/constants';
import { TEXT_LANGS, hasText } from '@/lib/translations';

export const SECTION_TITLE_MAX = 120;

/** Saving one language of a group section (shared by the editor and the server action). */
export const sectionSaveSchema = z.object({
    id: z.string().min(1).optional(),
    lang: z.enum(TEXT_LANGS),
    title: z.string().max(SECTION_TITLE_MAX, 'TITLE_TOO_LONG'),
    content: z.string().max(20000, 'DESCRIPTION_TOO_LONG'),
    visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']).optional(),
    originalLang: z.enum(TEXT_LANGS).optional(),
});

export type SectionSaveValues = z.infer<typeof sectionSaveSchema>;

/** A language counts as written when it has content or an owner-written (non-default) title: the seeded "About us" row is not a version. */
export function isSectionTextFilled(text: { title: string; content: string }): boolean {
    return hasText(text.content) || (text.title.trim() !== '' && !isDefaultSectionTitle(text.title));
}
