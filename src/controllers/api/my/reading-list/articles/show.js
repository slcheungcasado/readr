import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const { q = "", tagsOnly = false } = req.query;

    let matchedRecords = 0;
    let articles = [];
    // let topic = "HEADLINE";
    const whereQuery = q
      ? {
          OR: [
            {
              article: { title: { contains: q, mode: "insensitive" } },
            },
            {
              article: { sourceName: { contains: q, mode: "insensitive" } },
            },
            {
              article: { description: { contains: q, mode: "insensitive" } },
            },
          ],
        }
      : {};
    // tags: {
    //   some: {
    //     name: {
    //       equals: topic,
    //     },
    //   },
    // },
    const prismaQuery = {
      where: {
        ...whereQuery,
        ...articleTagsFilter,
        ...ownArticleTagsFilter,
        readingList: {
          userId,
        },
      },
      include: {
        tags: true,
        article: {
          include: {
            tags: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    };
    articles = await prisma.readingListArticle.findMany(prismaQuery);
    matchedRecords = await prisma.readingListArticle.count({
      where: {
        ...whereQuery,
        ...articleTagsFilter,
        ...ownArticleTagsFilter,
        readingList: {
          userId,
        },
      },
    });

    console.log(`Found ${matchedRecords} articles`);
    return res.status(200).json({
      articles: articles,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(matchedRecords / take),
        // numArticles: matchedRecords,
        userId,
      },
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
