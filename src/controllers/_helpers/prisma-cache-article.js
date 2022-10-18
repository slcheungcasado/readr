import { extract } from "article-parser";
import _ from "lodash";
// import { Readability, isProbablyReaderable } from "@mozilla/readability";
// import { JSDOM } from "jsdom";

import prisma from "./prisma.js";

const fieldsToOmit = [
  "content",
  "description",
  "image",
  "author",
  "source",
  "readingTime",
];

async function runArticleParser(dataToSave, { needHTML = false } = {}) {
  // From article-parser
  // {
  //   descriptionBetter: data.description,
  //   image: data.image,
  //   content: data.content, (not as good as readability's),
  //   author: data.author,
  //   source: data.source,
  //   readingTime: data.ttr
  // }

  try {
    const data = await extract(dataToSave.url, { wordsPerMinute: 250 });
    if (!data) {
      return dataToSave;
    }
    dataToSave.description = data?.description || "";
    dataToSave.image = data?.image || "";
    if (needHTML) dataToSave.content = data?.content || null;
    dataToSave.author = data?.author || "";
    dataToSave.source = data?.source || "";
    dataToSave.readingTime = data?.ttr || 0;
  } catch (err) {
    // console.log("failed to parse", dataToSave.title);
    // console.log("url", dataToSave.url);
    return dataToSave;
  }
  return dataToSave;
}

// function runReadability(doc, dataToSave) {
//   // From JSDOM.fromURL() + Readability
//   // {
//   //   descriptionShort: data.excerpt,
//   //   content: data.content, (best html parsing)
//   // }
//   const data = new Readability(doc).parse();
//   if (!data) {
//     return dataToSave;
//   }
//   dataToSave.content = data.content;
//   return dataToSave;
// }

export async function cacheArticle(article) {
  if (!article?.link) {
    return null;
  }

  // From GNews API Call
  let dataToSave = {
    title: article?.title,
    url: article.link,
    pubDate: new Date(article.pubDate),
    relatedLinks: article.content,
  };

  // Article Parsing (Preparing data for Prisma)
  dataToSave = await runArticleParser(dataToSave, {
    needHTML: true,
  });

  // expected data
  // const dataToSave = {
  //   title: "",
  //   url: "",
  //   pubDate: "",
  //   relatedLinks: "",
  //   content: "",
  //   description: "",
  //   image: "",
  //   author: "",
  //   source: "",
  //   readingTime: "",
  // };

  // Do prisma article create query
  try {
    const articleObj = await prisma.article.create({ data: dataToSave });
    return articleObj;
  } catch (err) {
    // throw err;
    // console.log("Failed to write article, trying filteredData...");
    const filteredData = _.omit(dataToSave, fieldsToOmit);
    try {
      const filteredObj = await prisma.article.create({ data: filteredData });
      return filteredObj;
    } catch (err) {
      console.log(err);
      console.log("Failed to store article: ", filteredData);
      return null;
    }
  }
}
