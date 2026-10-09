import { z } from 'zod';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

/** The words of an event in one language. */
const eventTextSchema = z.object({
    title: z.string().max(120, 'TITLE_TOO_LONG'),
    description: z.string().max(10000).nullish(),
    instructions: z.string().max(5000).nullish(),
});

export type EventText = z.infer<typeof eventTextSchema>;

export const eventSchema = z.object({
    /** The language the organiser writes in; the title is required here only. */
    originalLang: z.enum(TEXT_LANGS),
    texts: z.object({ lv: eventTextSchema, en: eventTextSchema }),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)).refine((d) => !Number.isNaN(d.getTime()), 'START_DATE_REQUIRED'),
    endDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null).refine((d) => d === null || !Number.isNaN(d.getTime()), 'END_DATE_INVALID'),
    location: z.string().min(2, 'LOCATION_REQUIRED'),
    bannerImage: z.string().url('INVALID_URL').or(z.literal('')).optional().nullable(),
    maxParticipants: z.number('MAX_PARTICIPANTS_INVALID').int('MAX_PARTICIPANTS_INVALID').positive('MAX_PARTICIPANTS_INVALID').nullable().optional(),
    visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY']).default('PUBLIC'),
    joinMode: z.enum(['OPEN', 'REQUEST']).default('OPEN'),
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.string().max(80).optional().nullable(),
}).superRefine((data, ctx) => {
    // A title is required in the original language only; the other language may be empty,
    // but a title that is started must be a real one.
    for (const lang of TEXT_LANGS) {
        const title = data.texts[lang].title.trim();
        const required = lang === data.originalLang;
        if ((required || title) && title.length < 3) {
            ctx.addIssue({ code: 'custom', message: 'TITLE_TOO_SHORT', path: ['texts', lang, 'title'] });
        }
    }
    if (data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({ code: 'custom', message: 'END_BEFORE_START', path: ['endDate'] });
    }
});

export type EventFormValues = z.infer<typeof eventSchema>;

// Need to type the form values differently since React Hook Form
// needs the raw string value before it is transformed to a Date by Zod.
export type EventFormData = {
    originalLang: TextLang;
    texts: Record<TextLang, { title: string; description: string; instructions: string }>;
    startDate: string | Date;
    endDate?: string | Date | null;
    location: string;
    bannerImage?: string | null;
    maxParticipants?: number | null;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    joinMode: 'OPEN' | 'REQUEST';
    isRecurring: boolean;
    recurrencePattern?: string | null;
};
