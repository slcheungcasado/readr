/*
  Warnings:

  - You are about to alter the column `url` on the `Article` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.

*/
-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "url" SET DATA TYPE VARCHAR(300);
