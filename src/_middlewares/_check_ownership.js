import prisma from "../controllers/_helpers/prisma.js";
import handleErrors from "../controllers/_helpers/handle-errors.js";

const checkOwnership = async (req, res, next) => {
  try {
    const {
      verifiedData: { articleId },
      session: {
        user: { id: userId },
      },
    } = req;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        readingList: true,
      },
    });

    await prisma.readingListArticle.findFirst({
      where: {
        articleId: Number(articleId),
        readingListId: user.readingList.id,
      },
      rejectOnNotFound: true,
    });

    req.verifiedData.readingListId = user.readingList.id;
    return next();
  } catch (err) {
    return handleErrors(res, err);
  }
};

export default checkOwnership;
