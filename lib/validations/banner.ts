import { z } from 'zod';
import { UNSPLASH_LIMITS } from '@/lib/constants';

/** Photographer credit stored with an Unsplash banner (R26). */
export const bannerCreditSchema = z
    .object({
        name: z.string().trim().min(1).max(80),
        username: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
    })
    .nullable();

export type BannerCredit = z.infer<typeof bannerCreditSchema>;

export const unsplashSearchSchema = z.object({
    query: z.string().trim().min(2).max(60),
    page: z.number().int().min(1).max(UNSPLASH_LIMITS.maxPage),
});

export const unsplashPhotoIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,20}$/);
