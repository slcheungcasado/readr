// import prisma from "../../../../_helpers/prisma.js";
import handleErrors from "../../_helpers/handle-errors.js";

import news from "gnews"; // works but data is subpar
import { isCached } from "../../_helpers/prisma-is-cached.js";
import { cacheArticle } from "../../_helpers/prisma-cache-article.js";
// import { extract } from "article-parser";

// import { Readability, isProbablyReaderable } from "@mozilla/readability";
// import { JSDOM } from "jsdom";

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
    // // Filters
    // const q = req.query.q || "";
    // const orderBy = req.query.orderBy || "id";
    // const sortBy = req.query.sortBy || "asc";

    // // Pagination
    // const take = 10;
    // const page = Number(req.query.page || "1");
    // const skip = (page - 1) * take;

    const headlines = await news.headlines({ n: 1 });
    // From GNews API Call
    // {
    //   title: headlines[index].title,
    //   url: headlines[index].link,
    //   pubDate: headlines[index].pubDate,
    //   relatedLinksHTML: headlines[index].content,
    // };

    let article = null;
    const articles = headlines.map(async (article) => {
      const foundArticle = await isCached(article);
      if (foundArticle) {
        return foundArticle;
      } else {
        return cacheArticle(article);
      }

      // From GNews API Call
      // {
      //   title: data.title,
      //   url: data.link,
      //   pubDate: data.pubDate,
      //   relatedLinksHTML: data.content,
      // };

      // From JSDOM.fromURL() + Readability
      // {
      //   descriptionShort: data.excerpt,
      //   articleHTML: data.content, (best html parsing)
      // }

      // From article-parser
      // {
      //   descriptionBetter: data.description,
      //   image: data.image,
      //   articleHTML: data.content, (not as good as line 54),
      //   author: data.author,
      //   source: data.source,
      //   readingTime: data.ttr
      // }
    });

    // const doc = await JSDOM.fromURL(
    //   "https://codecondo.com/leading-startup-companies-of-2021/"
    // );
    // const parsedArticle = new Readability(doc.window.document).parse();
    // console.log("parsedArticle", parsedArticle);

    // let article = null;

    // Extract article
    // const input = headlines[0]?.link;
    // try {
    //   article = await extract(input);
    // } catch (err) {
    //   console.error(err);
    // }
    // console.log("article", article);

    // const doc = new JSDOM(article.content);
    // console.log("doc", doc);
    // console.log(
    //   "isProbablyReaderable",
    //   isProbablyReaderable(doc.window.document)
    // );

    // console.log(
    //   "isProbablyReaderable",
    //   isProbablyReaderable(doc.window.document)
    // );

    return res.status(200).json({
      articles: article,
      // meta: {
      //   currentPage: page,
      //   totalPages: Math.ceil(articles.length / take),
      // },
    });
  } catch (err) {
    handleErrors(res, err);
  }
}
