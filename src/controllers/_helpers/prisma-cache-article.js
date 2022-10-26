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
  // Expected from article-parser
  // {
  //   descriptionBetter: data.description,
  //   image: data.image,
  //   content: data.content, (not as good as readability's),
  //   author: data.author,
  //   source: data.source,
  //   readingTime: data.ttr
  // }

  try {
    //method 1 (broken)
    // const controller = new AbortController();
    // const timeoutID = setTimeout(() => controller.abort(), 10 * 1000);
    // extract(
    //   dataToSave.url,
    //   { wordsPerMinute: 250 },
    //   { signal: controller.signal }
    // )
    //   .then((data) => {
    //     clearTimeout(timeoutID);
    //     if (!data || data === "timedOut") return dataToSave;
    //     dataToSave.description = data?.description || "";
    //     dataToSave.image = data?.image || "";
    //     if (needHTML) dataToSave.content = data?.content || null;
    //     dataToSave.author = data?.author || "";
    //     if (!dataToSave?.sourceName && !dataToSave?.sourceURL) {
    //       dataToSave.sourceName = data?.source;
    //     }
    //     dataToSave.readingTime = data?.ttr || 0;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return dataToSave;
    //   })
    //   .finally(() => {
    //     return dataToSave;
    //   });

    //method 2 (works)
    const data = extract(dataToSave.url, { wordsPerMinute: 250 });

    let timeOutID = null;
    const timeout = new Promise((resolve, reject) => {
      timeOutID = setTimeout(() => {
        resolve("timedOut");
      }, Number(process.env["REQUEST_TIMEOUT_SECONDS"]) * 1000);
    });

    return Promise.race([data, timeout])
      .then((value) => {
        if (!value || value === "timedOut") {
          return dataToSave;
        }
        clearTimeout(timeOutID);
        dataToSave.description = value?.description || "";
        dataToSave.image = value?.image || "";
        if (needHTML) dataToSave.content = value?.content || null;
        dataToSave.author = value?.author || "";
        if (!dataToSave?.sourceName && !dataToSave?.sourceURL) {
          dataToSave.sourceName = value?.source;
        }
        dataToSave.readingTime = value?.ttr || 0;
        return dataToSave;
      })
      .catch((err) => {
        console.log(err);
        return dataToSave;
      });
  } catch (err) {
    console.log(err);
    return dataToSave;
  }
}

export async function cacheArticle(article) {
  if (!article?.link) {
    return null;
  }

  // Expected after neo-gnews API Call
  let dataToSave = {
    title: article?.title,
    url: article?.link,
    pubDate: new Date(article?.pubDate),
    relatedLinks: article?.content,
    sourceName: article?.sourceName,
    sourceURL: article?.sourceURL,
    tags: article?.tags,
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
  //   sourceName: "",
  //   sourceURL: "",
  //   tags: [],
  //   readingTime: "",
  // };

  // Do prisma article create query
  try {
    const articleObj = await prisma.article.create({
      data: dataToSave,
      include: { tags: true },
    });

    return articleObj;
  } catch (err) {
    console.log(err);
    console.log("Failed to write article, trying filteredData...");
    const filteredData = _.omit(dataToSave, fieldsToOmit);
    try {
      const filteredObj = await prisma.article.create({
        data: filteredData,
        include: { tags: true },
      });
      return filteredObj;
    } catch (err) {
      console.log(err);
      console.log("Failed to store article: ", filteredData);
      return null;
    }
  }
}
