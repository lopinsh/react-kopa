import { z } from 'zod';

const slugSchema = z.string().trim().min(1).max(100);

/** The browser's Matrix device id (K5-05): made once, kept in localStorage. */
export const chatSessionSchema = z.object({ deviceId: z.string().regex(/^EJKW_[A-Z0-9]{10}$/) });
export type ChatSessionInput = z.infer<typeof chatSessionSchema>;

/** A Čats room: the Veids (L2 or L3) and, for a topic x city hub, the city's address segment. */
export const hubKeySchema = z.object({ hubSlug: slugSchema, city: slugSchema.optional() });
export type HubKeyInput = z.infer<typeof hubKeySchema>;

export const openRoomSchema = z.object({ hubKey: hubKeySchema });
