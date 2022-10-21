import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const { verifiedData } = req;
    const articleId = verifiedData.articleId;
    const userId = req.session.user.id;

    //get current user's reading list
    const userReadingList = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        readingList: true,
      },
    });

    console.log(userReadingList);

    const dataToSave = {};
    //create readinglistarticle
    // const createdArticle = await prisma.readingListArticle;
    return res.json(200).json({});
  } catch (err) {
    return handleErrors(res, err);
  }
}
