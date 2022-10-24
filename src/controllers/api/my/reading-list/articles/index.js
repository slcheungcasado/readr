import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const { q = "" } = req.query;

    // tag filtering
    let userTags = [];
    for (let [key, value] of Object.entries(req.query)) {
      if (key.startsWith("user-tag")) {
        userTags.push(value);
      }
    }

    const ownArticleTagsFilter =
      userTags.length > 0
        ? {
            tags: {
              some: {
                name: {
                  in: userTags,
                },
              },
            },
          }
        : {};

    // Filters
    // const sortBy = req.query.sortBy || "asc";

    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;

    let matchedRecords = 0;
    let articles = [];
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
    const prismaQuery = {
      where: {
        ...whereQuery,
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
        ...ownArticleTagsFilter,
        readingList: {
          userId,
        },
      },
    });

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
