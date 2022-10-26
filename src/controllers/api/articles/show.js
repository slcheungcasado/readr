import handleErrors from "../../_helpers/handle-errors.js";

import prisma from "../../_helpers/prisma.js";
import * as neoGnews from "../../_helpers/neo-gnews.js";
import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";
import _ from "lodash";

const TOPICS = [
  "WORLD",
  "NATION",
  "BUSINESS",
  "TECHNOLOGY",
  "ENTERTAINMENT",
  "SPORTS",
  "SCIENCE",
  "HEALTH",
];

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    let { topic } = req.params;
    let { doCache = false } = req.query;

    if (topic?.constructor?.name != "String") {
      return handleErrors(res, new Error("Invalid topic"));
    } else {
      topic = topic.toUpperCase();
      if (!TOPICS.includes(topic)) {
        return handleErrors(
          res,
          new Error("The provided article topic filter is not supported")
        );
      }
    }

    // console.log("This is topic in params", topic);
    // console.log("This is page in params", req.query.page);

    doCache = !!doCache;
    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;
    let articles = [];
    let matchedRecords = 0;

    // If you want to cache new articles
    if (doCache) {
      // const startTime = new Date();
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

      articles = await Promise.all(promises);
      matchedRecords = articles.length;
      // console.log("Benchmark", new Date() - startTime);
    } else {
      // Just fetch stored articles
      const whereQuery = {
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
    }

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
