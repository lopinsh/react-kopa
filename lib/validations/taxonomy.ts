import { z } from 'zod';
import { hexColorSchema } from './theme';
import { CATEGORY_NAME_MAX, LOCALES } from '@/lib/constants';

/** A category/tag name as people see it: trimmed, 2-60 characters. */
export const categoryNameSchema = z.string().trim().min(2).max(CATEGORY_NAME_MAX);

/** URL slug of a category: what slugify() produces (lowercase letters, digits, underscores, single hyphens). */
export const categorySlugSchema = z.string().trim().toLowerCase().min(1).max(80).regex(/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/);

const idSchema = z.string().min(1).max(64);

export const submitPendingTagSchema = z.object({ label: categoryNameSchema, parentId: idSchema });

export const createL2Schema = z.object({ parentId: idSchema, nameEn: categoryNameSchema, nameLv: categoryNameSchema });

export const approveTagSchema = z.object({
    id: idSchema,
    nameEn: categoryNameSchema,
    nameLv: categoryNameSchema,
    slugEn: categorySlugSchema,
    slugLv: categorySlugSchema,
});

export const updateL1Schema = z.object({ id: idSchema, color: hexColorSchema });

export const addAliasSchema = z.object({
    value: categoryNameSchema,
    categoryId: idSchema,
    locale: z.enum(LOCALES).optional(),
});

export const idListSchema = z.array(idSchema).max(200);

export const bulkMergeSchema = z.object({
    canonicalId: idSchema,
    mergedIds: idListSchema.min(1),
    canonicalUpdates: z.object({
        nameEn: categoryNameSchema,
        nameLv: categoryNameSchema,
        slugEn: categorySlugSchema,
        slugLv: categorySlugSchema,
    }),
});
