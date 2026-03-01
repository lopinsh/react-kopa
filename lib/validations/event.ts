import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    description: z.string().max(10000).optional().nullable(),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)),
    endDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
    location: z.string().min(2, 'Location is required'),
    instructions: z.string().max(5000).optional().nullable(),
    bannerImage: z.string().url().or(z.literal('')).optional().nullable(),
    maxParticipants: z.number().int().positive().nullable().optional(),
    visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']).default('PUBLIC'),
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.string().max(80).optional().nullable(),
}).refine((data) => {
    if (data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['endDate'],
});

export type EventFormValues = z.infer<typeof eventSchema>;

// Need to type the form values differently since React Hook Form
// needs the raw string value before it is transformed to a Date by Zod.
export type EventFormData = {
    title: string;
    slug: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    location: string;
    instructions?: string | null;
    bannerImage?: string | null;
    maxParticipants?: number | null;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    isRecurring: boolean;
    recurrencePattern?: string | null;
};

