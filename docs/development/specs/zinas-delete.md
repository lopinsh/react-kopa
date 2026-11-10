# Ziņas delete

Owner note cmvtq6lyq000ft901csgzgscu ("should be able to delete old messages/threads"), approved 10 Nov 2026. One session, one additive migration. Voice and the confirm patterns follow `docs/handbook/`; no drawing.

## Ledger

| id | Confirmed |
|---|---|
| ZD-01 | The chat's "…" menu (header, next to Bloķēt) holds "Dzēst sarunu". It asks first (`ConfirmPopover`, destructive button), then clears the history for this person only. |
| ZD-02 | Clearing sets `ConversationRead.clearedAt = now` (and `lastReadAt = now`). Messages with `createdAt <= clearedAt` are never returned to this person again; the chat leaves their list (and the unread count) until a message newer than `clearedAt` arrives, then it comes back showing only the newer ones. The other side keeps everything. Works for "Dzēsta grupa" (read-only) chats too. |
| ZD-03 | Who may clear: anyone who can open the conversation (`canAccess`: participants, the contact person, the group's current team). It only touches their own `ConversationRead`. Not a participant: `NOT_FOUND`. |
| ZD-04 | A message you sent has "Dzēst" (small trash button beside the bubble, with a `ConfirmPopover`). Only the sender may delete (`FORBIDDEN` otherwise; an unknown id is `NOT_FOUND`). Deleting twice is a no-op. |
| ZD-05 | The service blanks `content` to `''` and sets `deletedAt` (privacy: the text is gone from the database). Both sides see an italic muted "Ziņa izdzēsta" in the bubble's place, in the chat and as the last-message preview. |
| ZD-06 | Realtime: a new Soketi event `message-deleted` `{ id, conversationId }` goes to everyone who sees the chat (same recipients as `new-message`, the sender included). Open chats and list previews update live. |
| ZD-07 | Unread and digests ignore deleted messages (`deletedAt: null`) and anything at or before `clearedAt` (clearing also moves `lastReadAt`). The group Requests tab (application messages) skips deleted messages. |

Error codes (registry + `errors.*`, en and lv): `MESSAGE_DELETE_FAILED`, `CONVERSATION_CLEAR_FAILED`. Zod: `messageIdSchema` / `conversationIdSchema` in `lib/validations/message.ts`.

## Schema (expand only)

`ConversationRead.clearedAt DateTime?`, `Message.deletedAt DateTime?`; migration `add_message_delete`. The old app ignores both columns.

## Invariants

- Logic in `MessageService` (`deleteMessage`, `clearConversation`); actions only auth, validate, revalidate.
- Submission guard (`isPending`) on both buttons.
- No hardcoded strings; messages en + lv.

## Visual baseline

The Ziņas screen (`messages`, list only, no chat open) must not change: no baseline updates. Diffs elsewhere are bugs.

## Acceptance

Two seed users: A deletes a message, B sees "Ziņa izdzēsta" live; B clears the chat, A still has it; A writes again, the chat returns for B with only the new message. 360 and 1280 px, lv and en.
