import { z } from 'zod';

export const ANNOUNCEMENT_MAX_LENGTH = 2000;

/** One announcement, as typed by the group's owner or an admin. Shared by the form and the Server Action. */
export const announcementTextSchema = z.string().trim().min(1).max(ANNOUNCEMENT_MAX_LENGTH);
