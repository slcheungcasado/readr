/*
  Warnings:

  - You are about to drop the column `source` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "source",
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceURL" TEXT;
