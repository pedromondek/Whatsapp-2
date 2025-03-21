-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "deletedUser" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
