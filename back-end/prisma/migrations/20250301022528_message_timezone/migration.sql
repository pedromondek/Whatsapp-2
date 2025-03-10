-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "timestampFormated" TEXT,
ALTER COLUMN "timestamp" DROP DEFAULT;
