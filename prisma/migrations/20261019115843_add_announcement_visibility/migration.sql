-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'MEMBERS_ONLY';

-- Keep today's cards: posts of public groups were already shown to everyone.
UPDATE "Post" p SET "visibility" = 'PUBLIC' FROM "Group" g WHERE p."groupId" = g.id AND g.type = 'PUBLIC';
