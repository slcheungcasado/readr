import handleErrors from "../../_helpers/handle-errors.js";

import * as neoGnews from "../../_helpers/neo-gnews.js";

import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";

import prisma from "../../_helpers/prisma.js";
import { Topic } from "@prisma/client";
import { sortByField, sortByRelevance } from "../../_helpers/sort-utils.js";

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

    // Get current time
    const time = new Date();
    let mostRecentLog = null;

    // Get most recent log date to cache results if required
    try {
      mostRecentLog = await prisma.cacheLog.findFirstOrThrow({
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (err) {
      console.log(
        "Prisma found no cacheLog, making caching request",
        new Error(err)
      );
      doCache = true;
    }

    // prettier-ignore
    if (doCache || (time - new Date(mostRecentLog?.createdAt) >= Number(process.env["TIME_TILL_CACHE_SECONDS"]) * 1000)) {
      console.log('cache requested');
      const headlines = await neoGnews.headlines({ n: 100 });
      const promises = headlines.map((article) => {
        const url = new URL(article.link);
        article.link = url.origin + url.pathname;
        article.tags = {
          connectOrCreate: [Topic.HEADLINE].map((tag) => {
            return {
              where: { name: tag },
              create: { name: tag },
            };
          }),
        };
        return cacheIfNeeded(article);
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        console.error('Promise all failed or including tags failed', err);
      }


      try {
        await prisma.cacheLog.create({
          data: {
          topic: Topic.HEADLINE,
          query: q,
        },
      });
      } catch (err) {
        console.error('Failed to create cacheLog')
      }
    }

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
                equals: Topic.HEADLINE,
              },
            },
          },
        };
    const orderBy = q
      ? [
          { pubDate: "desc" },
          {
            _relevance: {
              fields: ["title", "description", "sourceName"],
              search: q,
              sort: "desc",
            },
          },
        ]
      : { pubDate: "desc" };
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
      orderBy,
    };
    articles = await prisma.article.findMany(prismaQuery);
    matchedRecords = await prisma.article.count({
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
    });

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
