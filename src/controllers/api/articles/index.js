import handleErrors from "../../_helpers/handle-errors.js";

import * as neoGnews from "../../_helpers/neo-gnews.js";

import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";

import prisma from "../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const { q = "" } = req.query;
    let { doCache = false } = req.query;
    doCache = !!doCache;

    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;

    let matchedRecords = 0;
    let articles = [];
    let topic = "HEADLINE";

    // If you want to cache new articles
    if (doCache) {
      const headlines = await neoGnews.headlines({ n: 100 });
      const promises = headlines.map((article) => {
        const url = new URL(article.link);
        article.link = url.origin + url.pathname;
        article.tags = {
          connectOrCreate: [topic].map((tag) => {
            return {
              where: { name: tag },
              create: { name: tag },
            };
          }),
        };
        return cacheIfNeeded(article);
      });

      articles = await Promise.all(promises);
      matchedRecords = articles.length;
    } else {
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
        : {
            tags: {
              some: {
                name: {
                  equals: topic,
                },
              },
            },
          };
      const prismaQuery = {
        where: {
          ...whereQuery,
          readingListArticle: {
            none: {
              readingList: {
                userId,
              },
            },
          },
        },
        include: {
          tags: true,
        },
        skip,
        take,
        orderBy: {
          pubDate: "desc",
        },
      };
      articles = await prisma.article.findMany(prismaQuery);
      matchedRecords = await prisma.article.count({ where: { ...whereQuery } });
    }

    // console.log(`Found ${articles.length} articles`);
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
