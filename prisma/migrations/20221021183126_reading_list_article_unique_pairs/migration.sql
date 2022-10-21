/*
  Warnings:

  - You are about to drop the `_ArticleToReadingList` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[readingListId,articleId]` on the table `ReadingListArticle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_ArticleToReadingList" DROP CONSTRAINT "_ArticleToReadingList_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToReadingList" DROP CONSTRAINT "_ArticleToReadingList_B_fkey";

-- DropTable
DROP TABLE "_ArticleToReadingList";

-- CreateIndex
CREATE UNIQUE INDEX "ReadingListArticle_readingListId_articleId_key" ON "ReadingListArticle"("readingListId", "articleId");
