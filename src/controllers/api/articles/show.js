import handleErrors from "../../_helpers/handle-errors.js";

import prisma from "../../_helpers/prisma.js";
import * as neoGnews from "../../_helpers/neo-gnews.js";
import { Topic } from "@prisma/client";
import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    let { topic } = req.params;
    let { q = "", doCache = false } = req.query;

    if (topic?.constructor?.name != "String") {
      return handleErrors(res, new Error("Invalid topic"));
    } else {
      topic = topic.toUpperCase();
      if (!Object.keys(Topic).includes(topic)) {
        return handleErrors(
          res,
          new Error("The provided article topic filter is not supported")
        );
      }
    }

    doCache = !!doCache;
    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;
    let articles = [];
    let matchedRecords = 0;

    // Get current time
    const time = new Date();
    let mostRecentLog = null;

    // Get most recent log date to cache results if required
    try {
      mostRecentLog = await prisma.cacheLog.findFirstOrThrow({
        where: {
          topic,
        },
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

    // If you want to cache new articles
    if (
      doCache ||
      time - new Date(mostRecentLog?.createdAt) >=
        Number(process.env["TIME_TILL_CACHE_SECONDS"]) * 1000
    ) {
      const headlines = await neoGnews.topic(topic, { n: 100 });

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

      await Promise.all(promises);
    }

    const whereQuery = {
      tags: {
        some: {
          name: {
            equals: topic,
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

    return res.status(200).json({
      articles: articles,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(matchedRecords / take),
        userId,
      },
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
