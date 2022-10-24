import handleErrors from "../../../../../_helpers/handle-errors.js";
import prisma from "../../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const {
      verifiedData: { id, currTags = {} },
    } = req;

    const userTags = [];
    for (let [key, value] of Object.entries(currTags)) {
      if (key.startsWith("user-tag")) {
        userTags.push(value.toUpperCase());
      }
    }

    // console.log("id (readingListArticle)", id);
    // console.log("connectTagQuery", connectTagQuery);

    const connectTagQuery = [
      ...userTags.map((name) => {
        return {
          where: {
            name,
          },
          create: {
            name,
          },
        };
      }),
    ];

    const updatedArticle = await prisma.readingListArticle.update({
      where: {
        id: Number(id),
      },
      data: {
        tags: {
          set: [],
          connectOrCreate: connectTagQuery,
        },
      },
      include: {
        article: true,
        tags: true,
      },
    });

    return res.status(200).json({
      tags: updatedArticle,
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
