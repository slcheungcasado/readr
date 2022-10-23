import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const { verifiedData } = req;
    const articleId = verifiedData.articleId;
    const userId = req.session.user.id;

    //get current user's reading list
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        readingList: true,
      },
    });

    // console.log("user", user);

    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
      },
      include: {
        tags: true,
      },
    });

    // console.log("article", article);

    const dataToSave = {
      readingList: { connect: { id: user.readingList.id } },
      article: { connect: { id: Number(article.id) } },
      tags: {
        create: [],
      },
    };

    // console.log("dataToSave", dataToSave);
    // for (const [k, v] of Object.entries(dataToSave)) {
    //   console.log(k, v);
    // }

    const createdArticle = await prisma.readingListArticle.create({
      data: dataToSave,
    });

    return res.status(200).json({
      article: createdArticle,
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
