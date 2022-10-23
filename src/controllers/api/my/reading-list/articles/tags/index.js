import handleErrors from "../../../../../_helpers/handle-errors.js";
import prisma from "../../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const {
      verifiedData: { tagName = "" },
    } = req;

    console.log("tagName", tagName);

    const matchingTags = await prisma.tag.findMany({
      where: {
        name: {
          contains: tagName,
          mode: "insensitive",
        },
      },
    });

    // // tag filtering
    // let defaultTags = [];
    // let userTags = [];
    // for (let [key, value] of Object.entries(req.query)) {
    //   console.log(key, value);
    //   if (key.startsWith("default-tag")) {
    //     defaultTags.push(value);
    //   } else if (key.startsWith("user-tag")) {
    //     userTags.push(value);
    //   }
    // }

    // // console.log("defaultTags.length > 0", defaultTags.length > 0);
    // const articleTagsFilter =
    //   defaultTags.length > 0
    //     ? {
    //         article: {
    //           tags: {
    //             some: {
    //               name: {
    //                 in: defaultTags,
    //               },
    //             },
    //           },
    //         },
    //       }
    //     : {};

    // // console.log("defaultTags.length > 0", defaultTags.length > 0);
    // const ownArticleTagsFilter =
    //   userTags.length > 0
    //     ? {
    //         tags: {
    //           some: {
    //             name: {
    //               in: userTags,
    //             },
    //           },
    //         },
    //       }
    //     : {};

    // // if (req?.query) console.log("req.query", req.query);
    // // Filters (Not really possible directly, just specify different endpoints instead)
    // // const q = req.query.q || "";
    // // const orderBy = req.query.orderBy || "id";
    // // const sortBy = req.query.sortBy || "asc";

    // // Pagination
    // const take = 10;
    // const page = Number(req.query.page || "1");
    // const skip = (page - 1) * take;

    // let matchedRecords = 0;
    // let articles = [];
    // // let topic = "HEADLINE";
    // const whereQuery = q
    //   ? {
    //       OR: [
    //         {
    //           article: { title: { contains: q, mode: "insensitive" } },
    //         },
    //         {
    //           article: { sourceName: { contains: q, mode: "insensitive" } },
    //         },
    //         {
    //           article: { description: { contains: q, mode: "insensitive" } },
    //         },
    //       ],
    //     }
    //   : {};
    // // tags: {
    // //   some: {
    // //     name: {
    // //       equals: topic,
    // //     },
    // //   },
    // // },
    // const prismaQuery = {
    //   where: {
    //     ...whereQuery,
    //     ...articleTagsFilter,
    //     ...ownArticleTagsFilter,
    //     readingList: {
    //       userId,
    //     },
    //   },
    //   include: {
    //     tags: true,
    //     article: {
    //       include: {
    //         tags: true,
    //       },
    //     },
    //   },
    //   skip,
    //   take,
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // };
    // articles = await prisma.readingListArticle.findMany(prismaQuery);
    // matchedRecords = await prisma.readingListArticle.count({
    //   where: {
    //     ...whereQuery,
    //     ...articleTagsFilter,
    //     ...ownArticleTagsFilter,
    //     readingList: {
    //       userId,
    //     },
    //   },
    // });

    // console.log(`Found ${matchedRecords} articles`);
    // return res.status(200).json({
    //   articles: articles,
    //   meta: {
    //     currentPage: page,
    //     totalPages: Math.ceil(matchedRecords / take),
    //     // numArticles: matchedRecords,
    //     userId,
    //   },
    // });
    return res.status(200).json({
      tags: matchingTags,
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
