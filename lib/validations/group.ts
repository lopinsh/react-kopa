import { z } from 'zod';

import { CITIES, GROUP_TYPES } from '@/lib/constants';

export type City = (typeof CITIES)[number];

// ─── Step 1: Categorization ───────────────────────────────────────────────────
export const step1Schema = z
    .object({
        categoryId: z.string().min(1, 'CATEGORY_REQUIRED'),
        wildcardLabel: z.string().min(2).max(60).optional(),
        wildcardParentId: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
    })
    .refine((data) => (data.tagIds && data.tagIds.length > 0) || (data.wildcardLabel && data.wildcardLabel.length > 0), {
        message: "TOPIC_REQUIRED",
        path: ["tagIds"],
    });

// ─── Step 2: The Basics ───────────────────────────────────────────────────────
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
    bannerImage: z.string().url().or(z.literal('')).optional().nullable(),
    instructions: z
        .string()
        .max(5000, 'INSTRUCTIONS_TOO_LONG')
        .optional()
        .nullable()
        .or(z.literal('')),
    city: z.enum(CITIES),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'INVALID_COLOR').optional().nullable().or(z.literal('')),
});

// ─── Step 3: Access & Privacy ────────────────────────────────────────────────
export const step3Schema = z.object({
    type: z.enum(GROUP_TYPES),
    isAcceptingMembers: z.boolean().default(true),
    discordLink: z.string().url().or(z.literal('')).optional().nullable(),
    websiteLink: z.string().url().or(z.literal('')).optional().nullable(),
    instagramLink: z.string().url().or(z.literal('')).optional().nullable(),
});

// ─── Combined Form Schema ────────────────────────────────────────────────────
export const groupFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type GroupFormValues = z.infer<typeof groupFormSchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
