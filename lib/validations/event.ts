import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(3, 'TITLE_TOO_SHORT').max(120, 'TITLE_TOO_LONG'),
    description: z.string().max(10000).optional().nullable(),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)).refine((d) => !Number.isNaN(d.getTime()), 'START_DATE_REQUIRED'),
    endDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null).refine((d) => d === null || !Number.isNaN(d.getTime()), 'END_DATE_INVALID'),
    location: z.string().min(2, 'LOCATION_REQUIRED'),
    instructions: z.string().max(5000).optional().nullable(),
    bannerImage: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    maxParticipants: z.number('MAX_PARTICIPANTS_INVALID').int('MAX_PARTICIPANTS_INVALID').positive('MAX_PARTICIPANTS_INVALID').nullable().optional(),
    visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']).default('PUBLIC'),
    joinMode: z.enum(['OPEN', 'REQUEST']).default('OPEN'),
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.string().max(80).optional().nullable(),
}).refine((data) => {
    if (data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
}, {
    message: 'END_BEFORE_START',
    path: ['endDate'],
});

export type EventFormValues = z.infer<typeof eventSchema>;

// Need to type the form values differently since React Hook Form
// needs the raw string value before it is transformed to a Date by Zod.
export type EventFormData = {
    title: string;
    description?: string | null;
    startDate: string | Date;
    endDate?: string | Date | null;
    location: string;
    instructions?: string | null;
    bannerImage?: string | null;
    maxParticipants?: number | null;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    joinMode: 'OPEN' | 'REQUEST';
    isRecurring: boolean;
    recurrencePattern?: string | null;
};

