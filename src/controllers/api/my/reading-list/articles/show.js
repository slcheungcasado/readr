import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    let { tagsOnly = false } = req.query;
    tagsOnly = !!tagsOnly;
    const { id } = req.params;
    // console.log("id", id);
    // console.log("req.params", req.params);
    // console.log("req.query", req.query);
    // console.log("tagsOnly", tagsOnly);
    const selectQuery = tagsOnly
      ? {
          select: {
            tags: true,
          },
        }
      : {};
    const prismaQuery = {
      where: {
        id: Number(id),
      },
      include: {
        tags: true,
        article: {
          ...selectQuery,
        },
      },
    };
    const matchedArticle = await prisma.readingListArticle.findUnique(
      prismaQuery
    );

    return res.status(200).json({
      articles: matchedArticle,
      meta: {
        userId,
      },
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
