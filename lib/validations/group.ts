import { z } from 'zod';

import { GROUP_TYPES, MAX_GROUP_TAGS } from '@/lib/constants';
import { TEXT_LANGS } from '@/lib/translations';
import { bannerCreditSchema } from '@/lib/validations/banner';


// Step 1: Categorization
/**
 * `maxTags` defaults to the global limit. Forms for groups saved before the limit (more tags than
 * allowed) pass their current count so an untouched form still validates; they can only remove tags.
 */
export function tagIdsSchema(maxTags: number = MAX_GROUP_TAGS) {
    return z.array(z.string()).min(1, 'TOPIC_REQUIRED').max(Math.max(maxTags, MAX_GROUP_TAGS), 'TOPIC_LIMIT');
}

export const step1Object = z.object({
    categoryId: z.string().min(1, 'CATEGORY_REQUIRED'),
    tagIds: tagIdsSchema(),
});

export const step1Schema = step1Object;

export const GROUP_NAME_MAX = 80;
/** "Ko meklējam?" (AR-35): one short line. */
export const GROUP_LOOKING_FOR_MAX = 60;

/** The longest "Par mums" text, per language. */
export const GROUP_ABOUT_MAX = 10000;

// Step 2: The Basics
export const step2Schema = z.object({
    name: z
        .string()
        .min(3, 'NAME_TOO_SHORT')
        .max(GROUP_NAME_MAX, 'NAME_TOO_LONG'),
    description: z
        .string()
        .max(GROUP_ABOUT_MAX, 'DESCRIPTION_TOO_LONG')
        .optional()
        .nullable()
        .or(z.literal('')),
    /** "Ko meklējam?" (AR-35): optional, trimmed; empty → null. */
    lookingFor: z.string().trim().max(GROUP_LOOKING_FOR_MAX, 'LOOKING_FOR_TOO_LONG').nullish().transform((v) => v || null),
    bannerImage: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    /** Photographer credit of an Unsplash banner; the server drops it for any other URL. */
    bannerCredit: bannerCreditSchema.optional(),
    /** The city's stored value (`City.slug`). The server checks that it exists and may be used. */
    city: z.string().min(1, 'CITY_REQUIRED').max(80, 'CITY_REQUIRED'),
    discordLink: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    websiteLink: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    instagramLink: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
});

// Step 3: Access & Privacy
export const step3Object = z.object({
    type: z.enum(GROUP_TYPES),
    isAcceptingMembers: z.boolean(),
});

export const step3Schema = step3Object;

// Combined Form Schema
export function buildGroupFormSchema(maxTags: number = MAX_GROUP_TAGS) {
    return step1Object
        .extend({ tagIds: tagIdsSchema(maxTags) })
        .merge(step2Schema)
        .merge(step3Object);
}

export const groupFormSchema = buildGroupFormSchema();

/** Creating a group: the form's fields plus "Par mums" in every language and the language it is written in (the original). */
export const groupCreateSchema = groupFormSchema.extend({
    originalLang: z.enum(TEXT_LANGS),
    about: z.record(z.enum(TEXT_LANGS), z.string().max(GROUP_ABOUT_MAX, 'DESCRIPTION_TOO_LONG')),
});

export type GroupCreateValues = z.infer<typeof groupCreateSchema>;

export type GroupFormValues = z.infer<typeof groupFormSchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
