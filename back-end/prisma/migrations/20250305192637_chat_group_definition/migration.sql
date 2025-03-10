-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "groupImage" BYTEA,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false;
