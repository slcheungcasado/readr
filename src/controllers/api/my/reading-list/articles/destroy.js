import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const {
      verifiedData: { articleId, readingListId },
    } = req;

    //@@unique constraint required on readingListArticle schema
    const whereQuery = {
      where: {
        readingListId_articleId: {
          readingListId,
          articleId,
        },
      },
    };

    const removedArticle = await prisma.readingListArticle.delete(whereQuery);

    return res.status(200).json({
      article: removedArticle,
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
