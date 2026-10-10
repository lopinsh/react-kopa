import { z } from 'zod';

export const ANNOUNCEMENT_TITLE_MIN = 3;
export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_MAX_LENGTH = 5000;

/** One announcement, as typed by the group's owner or an admin. Shared by the pop-up form and the Server Action. */
export const announcementSchema = z.object({
    title: z.string().trim().min(ANNOUNCEMENT_TITLE_MIN).max(ANNOUNCEMENT_TITLE_MAX),
    content: z.string().trim().min(1).max(ANNOUNCEMENT_MAX_LENGTH),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
