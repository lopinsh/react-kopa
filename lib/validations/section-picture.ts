import { z } from 'zod';
import { MAX_SECTION_PICTURES } from '@/lib/constants';
import { bannerCreditSchema } from './banner';

export const sectionPicturePickSchema = z.object({
    url: z.string().trim().url().max(2048),
    credit: bannerCreditSchema,
});

export const sectionPictureIdsSchema = z
    .array(z.string().cuid())
    .min(1)
    .max(MAX_SECTION_PICTURES)
    .refine((ids) => new Set(ids).size === ids.length);

/** A real section id, or `'about'` for the virtual first section of a group that has no section rows yet. */
export const sectionIdSchema = z.union([z.string().cuid(), z.literal('about')]);

export const pictureIdSchema = z.string().cuid();

export type SectionPicturePick = z.infer<typeof sectionPicturePickSchema>;
