import { z } from 'zod';

import { CITIES, GROUP_TYPES, MAX_GROUP_TAGS } from '@/lib/constants';

export type City = (typeof CITIES)[number];

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

// Step 2: The Basics
export const step2Schema = z.object({
    name: z
        .string()
        .min(3, 'NAME_TOO_SHORT')
        .max(80, 'NAME_TOO_LONG'),
    description: z
        .string()
        .max(10000, 'DESCRIPTION_TOO_LONG')
        .optional()
        .nullable()
        .or(z.literal('')),
    bannerImage: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    city: z.enum(CITIES, { error: 'CITY_REQUIRED' }),
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

export type GroupFormValues = z.infer<typeof groupFormSchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
