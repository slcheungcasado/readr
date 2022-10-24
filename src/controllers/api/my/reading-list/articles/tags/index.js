import handleErrors from "../../../../../_helpers/handle-errors.js";
import prisma from "../../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const {
      verifiedData: { tagName = "", showMine = false, currTags = {} },
    } = req;

    const userTags = [];
    const take = showMine ? {} : { take: 10 };

    if (showMine) {
      const userReadingList = await prisma.readingList.findUnique({
        where: {
          userId,
        },
      });

      const userReadingListArticleIds =
        await prisma.readingListArticle.findMany({
          where: {
            readingListId: userReadingList.id,
          },
          select: {
            id: true,
          },
        });

      const allOwnTags = await prisma.tag.findMany({
        where: {
          readingListArticle: {
            some: {
              id: {
                in: userReadingListArticleIds.map((x) => x.id),
              },
            },
          },
        },
      });

      return res.status(200).json({
        tags: allOwnTags,
      });
    } else {
      for (let [key, value] of Object.entries(currTags)) {
        // console.log(key, value);
        if (key.startsWith("user-tag")) {
          userTags.push(value.toUpperCase());
        }
      }

      const matchingTags = await prisma.tag.findMany({
        where: {
          name: {
            contains: tagName,
            mode: "insensitive",
          },
          NOT: {
            name: { in: userTags },
          },
        },
        orderBy: {
          _relevance: {
            fields: ["name"],
            search: tagName,
            sort: "asc",
          },
        },
        ...take,
      });

      return res.status(200).json({
        tags: matchingTags,
      });
    }
  } catch (err) {
    return handleErrors(res, err);
  }
}
