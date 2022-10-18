// import prisma from "../../../../_helpers/prisma.js";
import handleErrors from "../../_helpers/handle-errors.js";

import news from "gnews"; // works but data is subpar
import { extract } from "article-parser";

import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";
// import DOMPurify from "dompurify";

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
    // const articles = await news.search("Los Angeles Lakers");
    // const headlines = await news.headlines();
    const topic = await news.topic("SPORTS", {
      country: "us",
      language: "en",
      n: 1,
    });
    console.log(topic);
    console.log("topic.length", topic.length);
    let article = null;

    // Extract article
    const input = topic[0]?.link;
    try {
      article = await extract(input);
    } catch (err) {
      console.error(err);
    }

    const doc = new JSDOM(article.content);
    console.log("doc", doc);
    console.log(
      "isProbablyReaderable",
      isProbablyReaderable(doc.window.document)
    );
    const parsedArticle = new Readability(doc.window.document).parse();
    console.log("parsedArticle", parsedArticle);

    return res.status(200).json({
      article,
      parsedArticle,
      meta: {},
    });
  } catch (err) {
    handleErrors(res, err);
  }
}
