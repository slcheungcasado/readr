import handleErrors from "../../_helpers/handle-errors.js";

// import news from "gnews";
import * as neoGnews from "../../_helpers/neo-gnews.js";

import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";

import prisma from "../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const { q = "" } = req.query;
    let { doCache = false } = req.query;
    doCache = !!doCache;
    // Filters (Not really possible directly, just specify different endpoints instead)
    // const q = req.query.q || "";
    // const orderBy = req.query.orderBy || "id";
    // const sortBy = req.query.sortBy || "asc";

    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;
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
    } else {
      if (q) {
        articles = await prisma.article.findMany({
          where: {
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
          },
          include: {
            tags: true,
          },
          take,
        });
        console.log(`Found ${articles.length} articles`);
      } else {
        articles = await prisma.article.findMany({
          where: {
            tags: {
              some: {
                name: {
                  equals: topic,
                },
              },
            },
          },
          include: {
            tags: true,
          },
          take,
        });
      }
    }

    // console.log(articles);

    return res.status(200).json({
      articles: articles.slice(skip, Math.min(take, articles.length)),
      meta: {
        currentPage: page,
        totalPages: Math.ceil(articles.length / take),
      },
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
