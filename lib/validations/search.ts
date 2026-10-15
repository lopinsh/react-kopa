import { z } from 'zod';
import { LOCALES, SEARCH_WORD_MAX } from '@/lib/constants';

/** `GET /api/search` query: the word, the places (comma list, parsed with `parseCities`), one theme slug, the page it was opened on, the language. */
export const searchQuerySchema = z.object({
    q: z.string().trim().max(SEARCH_WORD_MAX).default(''),
    city: z.string().max(500).default(''),
    theme: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
    kind: z.enum(['groups', 'events']).optional(),
    locale: z.enum(LOCALES)
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
