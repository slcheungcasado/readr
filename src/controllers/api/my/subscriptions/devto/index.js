// import prisma from "../../../../_helpers/prisma.js";
import handleErrors from "../../../../_helpers/handle-errors.js";
// import googleNewsScraper from "neo-scraper-google-news"; // broken

import news from "gnews"; // works but data is subpar
import { extract } from "article-parser";

// import { Readability } from "@mozilla/readability";
// import { JSDOM } from "jsdom";
// import DOMPurify from "dompurify";

// import googleNewsAPI from "google-news-json";
// import googleNewsApi from "googlenewsapi"; //broken

// const storeFunction = (info) => {
//   for (let [k, v] of Object.entries(info)) {
//     console.log(k, v);
//   }
// };
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
    // googleNewsApi.initialize(storeFunction);
    // googleNewsApi.addCountryCode("US");
    // // const intervalId = setInterval(googleNewsApi.refresh, 1000 * 60 * 60);
    // googleNewsApi.refresh();
    // googleNewsApi.search("Cars").then((results) => {
    //   console.log("query results", results);
    // });

    const articles = await news.search("Los Angeles Lakers");
    const headlines = await news.headlines();
    const geo = await news.geo();
    const topic = await news.topic("SPORTS");
    let article = null;
    // const articles = await googleNewsAPI.getNews(
    //   googleNewsAPI.TOP_NEWS,
    //   null,
    //   "en-GB"
    // );

    const input = topic[1].link;
    try {
      article = await extract(input);
    } catch (err) {
      console.error(err);
    }

    return res.status(200).json({
      articles: articles,
      headlines,
      geo,
      topic,
      parsedArticle: article,
      meta: {},
    });
  } catch (err) {
    handleErrors(res, err);
  }
}
