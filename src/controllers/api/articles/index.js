import handleErrors from "../../_helpers/handle-errors.js";

import news from "gnews";
import { cacheIfNeeded } from "../../_helpers/prisma-is-cached.js";

// const TOPICS = [
//   "WORLD",
//   "NATION",
//   "BUSINESS",
//   "TECHNOLOGY",
//   "ENTERTAINMENT",
//   "SPORTS",
//   "SCIENCE",
//   "HEALTH",
// ];

export default async function (req, res) {
  try {
    // Filters (Not really possible directly, just specify different endpoints instead)
    // const q = req.query.q || "";
    // const orderBy = req.query.orderBy || "id";
    // const sortBy = req.query.sortBy || "asc";

    // Pagination
    const take = 10;
    const page = Number(req.query.page || "1");
    const skip = (page - 1) * take;

    const headlines = await news.topic("SPORTS", { n: 30 });

    const promises = headlines.map((article) => {
      const url = new URL(article.link);
      article.link = url.origin + url.pathname;
      return cacheIfNeeded(article);
    });

    let articles = await Promise.all(promises);

    // too slow :(
    // articles = articles.filter((a) => a);

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
