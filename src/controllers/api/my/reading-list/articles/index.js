import handleErrors from "../../../../_helpers/handle-errors.js";
import prisma from "../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const { q = "" } = req.query;
    // Filters (Not really possible directly, just specify different endpoints instead)
    // const q = req.query.q || "";
    // const orderBy = req.query.orderBy || "id";
    // const sortBy = req.query.sortBy || "asc";

    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;

    let matchedRecords = 0;
    let articles = [];
    // let topic = "HEADLINE";
    const whereQuery = q
      ? {
          OR: [
            {
              title: { contains: q, mode: "insensitive" },
            },
            {
              sourceName: { contains: q, mode: "insensitive" },
            },
            {
              description: { contains: q, mode: "insensitive" },
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
      where: { ...whereQuery },
    });

    console.log(`Found ${articles.length} articles`);
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
