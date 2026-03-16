import { z } from 'zod';

import { CITIES, GROUP_TYPES } from '@/lib/constants';

export type City = (typeof CITIES)[number];

// Step 1: Categorization
export const step1Object = z.object({
    categoryId: z.string().min(1, 'CATEGORY_REQUIRED'),
    tagIds: z.array(z.string()).min(1, 'TOPIC_REQUIRED'),
});

export const step1Schema = step1Object;

// Step 2: The Basics
export const step2Schema = z.object({
    name: z
        .string()
        .min(3, 'NAME_TOO_SHORT')
        .max(80, 'NAME_TOO_LONG'),
    slug: z
        .string()
        .min(3, 'SLUG_TOO_SHORT')
        .max(80, 'SLUG_TOO_LONG')
        .regex(/^[a-z0-9-]+$/, 'SLUG_INVALID')
        .optional(),
    description: z
        .string()
        .max(10000, 'DESCRIPTION_TOO_LONG')
        .optional()
        .nullable()
        .or(z.literal('')),
    bannerImage: z.string().url().or(z.literal('')).optional().nullable(),
    city: z.enum(CITIES),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'INVALID_COLOR').optional().nullable().or(z.literal('')),
    discordLink: z.string().url().or(z.literal('')).optional().nullable(),
    websiteLink: z.string().url().or(z.literal('')).optional().nullable(),
    instagramLink: z.string().url().or(z.literal('')).optional().nullable(),
});

// Step 3: Access & Privacy
export const step3Object = z.object({
    type: z.enum(GROUP_TYPES),
    isAcceptingMembers: z.boolean(),
});

export const step3Schema = step3Object;

// Combined Form Schema
export const groupFormSchema = step1Object
    .merge(step2Schema)
    .merge(step3Object);

export type GroupFormValues = z.infer<typeof groupFormSchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
