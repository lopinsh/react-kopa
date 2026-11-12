import { z } from 'zod';
import { messageTextSchema } from './message';

const slugSchema = z.string().trim().min(1).max(100);

/** The browser's Matrix device id (K5-05): made once, kept in localStorage. */
export const chatSessionSchema = z.object({ deviceId: z.string().regex(/^EJKW_[A-Z0-9]{10}$/) });
export type ChatSessionInput = z.infer<typeof chatSessionSchema>;

/** A Čats room: the Veids (L2 or L3) and, for a topic x city hub, the city's address segment. */
export const hubKeySchema = z.object({ hubSlug: slugSchema, city: slugSchema.optional() });
export type HubKeyInput = z.infer<typeof hubKeySchema>;

export const openRoomSchema = z.object({ hubKey: hubKeySchema });

/** Site user ids whose names a Čats line shows (K5-11): at most one screenful of senders. */
export const chatNamesSchema = z.object({ hubKey: hubKeySchema, ids: z.array(z.string().trim().min(1).max(40)).min(1).max(100) });
export type ChatNamesInput = z.infer<typeof chatNamesSchema>;

/** One line typed into the composer (K5-11). */
export const chatLineSchema = z.string().trim().min(1).max(2000);

/** The online list of one room (K5-18) is asked by the same key as opening it. */
export const roomOnlineSchema = openRoomSchema;

/** The name card (K5-19) and a first message to someone from it (K5-20, K-82: a request, never a private room). */
export const personCardSchema = z.object({ userId: z.string().trim().min(1).max(40) });
export const directChatRequestSchema = z.object({ userId: personCardSchema.shape.userId, content: messageTextSchema });

/** Iestatījumi of Čats (K5-22): each switch saves on its own, so any subset (at least one) is valid. */
export const chatSettingsSchema = z
    .object({ mentionNotify: z.boolean(), allowRequests: z.boolean() })
    .partial()
    .refine((v) => Object.values(v).some((x) => x !== undefined), 'VALIDATION_FAILED');

/** The line a person has just sent with @mentions in it (K5-24): the room and the Matrix event id (`$…`). */
export const notifyMentionsSchema = z.object({ hubKey: hubKeySchema, eventId: z.string().trim().min(2).max(200).startsWith('$') });
