-- Replies moved out of the old single `reply` column (ids 'fr_<note id>') were all stamped "agent", but nobody knows who wrote them.
-- Clear the flag so they show as an earlier reply instead. New agent replies have cuid ids and keep byAgent = true.
UPDATE "FeedbackReply" SET "byAgent" = false WHERE "authorId" IS NULL AND "id" LIKE 'fr\_%';
