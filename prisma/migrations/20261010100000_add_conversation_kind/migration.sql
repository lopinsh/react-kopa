-- CreateEnum
CREATE TYPE "ConversationKind" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "contactUserId" TEXT,
ADD COLUMN     "kind" "ConversationKind" NOT NULL DEFAULT 'DIRECT';

-- CreateTable
CREATE TABLE "ConversationRead" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationRead_userId_idx" ON "ConversationRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationRead_conversationId_userId_key" ON "ConversationRead"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Conversation_contactUserId_idx" ON "Conversation"("contactUserId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_contactUserId_fkey" FOREIGN KEY ("contactUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRead" ADD CONSTRAINT "ConversationRead_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRead" ADD CONSTRAINT "ConversationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data: turn the per-moderator join-request chats (2.21) and every ApplicationMessage into ONE group
-- chat per (group, person). Group chat participants = the contact person only; the team is the group's
-- current OWNER/ADMIN memberships (live), so nothing about moderators is stored.
DO $$
DECLARE
  r RECORD;
  target TEXT;
  cid TEXT;
BEGIN
  -- Contact person of each join-request chat = the applicant. 2.21 always stored the moderator's question
  -- as an ApplicationMessage *to* the applicant (a withdrawn request deletes only the applicant's own
  -- rows), and copied the applicant's join message in as the chat's first message. So: prefer a
  -- participant who is not an owner/admin now, then the one the application messages were addressed to,
  -- then the sender of the first message, then the lowest id. A participant that matches neither sign
  -- (e.g. the applicant's account is gone) is not a contact, and the chat stays as it is.
  CREATE TEMP TABLE _conv_contact AS
  SELECT c.id AS conversation_id, c."originGroupId" AS group_id, c."createdAt" AS created_at,
    (SELECT p."B" FROM "_ConversationParticipants" p
      WHERE p."A" = c.id
        AND (
          EXISTS (SELECT 1 FROM "ApplicationMessage" a WHERE a."groupId" = c."originGroupId" AND a."applicationUserId" = p."B")
          OR p."B" = (SELECT m."senderId" FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt", m.id LIMIT 1)
        )
      ORDER BY
        EXISTS (SELECT 1 FROM "Membership" m WHERE m."groupId" = c."originGroupId" AND m."userId" = p."B" AND m.role IN ('OWNER', 'ADMIN')) ASC,
        EXISTS (SELECT 1 FROM "ApplicationMessage" a WHERE a."groupId" = c."originGroupId" AND a."applicationUserId" = p."B") DESC,
        COALESCE(p."B" = (SELECT m."senderId" FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt", m.id LIMIT 1), false) DESC,
        p."B"
      LIMIT 1) AS contact_id
  FROM "Conversation" c
  WHERE c."originType" = 'JOIN_REQUEST' AND c."originGroupId" IS NOT NULL;

  DELETE FROM _conv_contact WHERE contact_id IS NULL;

  -- Merge the chats of the same person x group into the oldest one, keeping every message.
  FOR r IN SELECT group_id, contact_id FROM _conv_contact GROUP BY group_id, contact_id LOOP
    SELECT conversation_id INTO target FROM _conv_contact
      WHERE group_id = r.group_id AND contact_id = r.contact_id
      ORDER BY created_at, conversation_id LIMIT 1;

    UPDATE "Message" SET "conversationId" = target
      WHERE "conversationId" IN (
        SELECT conversation_id FROM _conv_contact
        WHERE group_id = r.group_id AND contact_id = r.contact_id AND conversation_id <> target);

    DELETE FROM "Conversation"
      WHERE id IN (
        SELECT conversation_id FROM _conv_contact
        WHERE group_id = r.group_id AND contact_id = r.contact_id AND conversation_id <> target);

    DELETE FROM "_ConversationParticipants" WHERE "A" = target AND "B" <> r.contact_id;
    UPDATE "Conversation" SET kind = 'GROUP', "contactUserId" = r.contact_id WHERE id = target;
  END LOOP;

  DROP TABLE _conv_contact;

  -- Each 2.21 moderator chat got its own copy of the applicant's join message (same sender, text and
  -- time). Merged, those copies sit side by side: keep one.
  DELETE FROM "Message" m
    USING "Message" d, "Conversation" c
    WHERE c.id = m."conversationId" AND c.kind = 'GROUP'
      AND d."conversationId" = m."conversationId" AND d."senderId" = m."senderId"
      AND d.content = m.content AND d."createdAt" = m."createdAt" AND d.id < m.id;

  -- Join-request chats whose group was deleted: the applicant's read-only group chat (the team went with
  -- the group). The applicant is the sender of the first message, their copied join message.
  UPDATE "Conversation" c
    SET kind = 'GROUP', "contactUserId" = f.sender_id
    FROM (
      SELECT c2.id,
        (SELECT m."senderId" FROM "Message" m WHERE m."conversationId" = c2.id ORDER BY m."createdAt", m.id LIMIT 1) AS sender_id
      FROM "Conversation" c2
      WHERE c2."originType" = 'JOIN_REQUEST' AND c2."originGroupId" IS NULL
    ) f
    WHERE c.id = f.id
      AND EXISTS (SELECT 1 FROM "_ConversationParticipants" p WHERE p."A" = f.id AND p."B" = f.sender_id);
  DELETE FROM "_ConversationParticipants" p
    USING "Conversation" c
    WHERE p."A" = c.id AND c.kind = 'GROUP' AND c."originGroupId" IS NULL AND p."B" <> c."contactUserId";

  -- ApplicationMessages: add each one to its group chat (creating the chat when there is none yet),
  -- unless the same text from the same sender (within 10 s) is already there from the 2.21 copy.
  FOR r IN SELECT DISTINCT "groupId", "applicationUserId" FROM "ApplicationMessage" LOOP
    SELECT id INTO cid FROM "Conversation"
      WHERE "originGroupId" = r."groupId" AND "contactUserId" = r."applicationUserId";

    IF cid IS NULL THEN
      cid := 'cv' || md5(random()::text || clock_timestamp()::text || r."groupId" || r."applicationUserId");
      INSERT INTO "Conversation" (id, kind, "originType", "originGroupId", "contactUserId", "createdAt", "updatedAt")
      VALUES (
        cid, 'GROUP',
        CASE WHEN EXISTS (SELECT 1 FROM "Membership" m WHERE m."groupId" = r."groupId" AND m."userId" = r."applicationUserId")
          THEN 'JOIN_REQUEST' ELSE 'GROUP_CONTACT' END,
        r."groupId", r."applicationUserId",
        (SELECT min(a."createdAt") FROM "ApplicationMessage" a WHERE a."groupId" = r."groupId" AND a."applicationUserId" = r."applicationUserId"),
        now());
      INSERT INTO "_ConversationParticipants" ("A", "B") VALUES (cid, r."applicationUserId");
    END IF;

    INSERT INTO "Message" (id, content, "conversationId", "senderId", "createdAt")
    SELECT 'mg' || md5(a.id), a.content, cid, a."senderId", a."createdAt"
    FROM "ApplicationMessage" a
    WHERE a."groupId" = r."groupId" AND a."applicationUserId" = r."applicationUserId"
      AND NOT EXISTS (
        SELECT 1 FROM "Message" m
        WHERE m."conversationId" = cid AND m."senderId" = a."senderId" AND m.content = a.content
          AND abs(extract(epoch FROM (m."createdAt" - a."createdAt"))) < 10);
  END LOOP;
END $$;

-- A group chat is as recent as its newest message.
UPDATE "Conversation" c
SET "updatedAt" = COALESCE((SELECT max(m."createdAt") FROM "Message" m WHERE m."conversationId" = c.id), c."updatedAt")
WHERE c.kind = 'GROUP';

-- Existing chats start as read for everyone who can see them (unread tracking begins now).
INSERT INTO "ConversationRead" (id, "conversationId", "userId", "lastReadAt")
SELECT 'cr' || md5(x."conversationId" || x."userId"), x."conversationId", x."userId", now()
FROM (
  SELECT p."A" AS "conversationId", p."B" AS "userId" FROM "_ConversationParticipants" p
  UNION
  SELECT c.id, m."userId" FROM "Conversation" c
    JOIN "Membership" m ON m."groupId" = c."originGroupId"
  WHERE c.kind = 'GROUP' AND m.role IN ('OWNER', 'ADMIN')
) x;

-- CreateIndex (after the merge, so it cannot fail on duplicates)
CREATE UNIQUE INDEX "Conversation_originGroupId_contactUserId_key" ON "Conversation"("originGroupId", "contactUserId");

-- Nothing reads ApplicationMessage any more: the group chat holds those messages.
DROP TABLE "ApplicationMessage";
