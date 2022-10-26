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
    //method 1
    // const controller = new AbortController();
    // const timeoutID = setTimeout(() => controller.abort(), 5000);
    // const data = await extract(
    //   dataToSave.url,
    //   { wordsPerMinute: 250 },
    //   { signal: controller.signal }
    // );
    // clearTimeout(timeoutID);

    //method2
    const data = extract(dataToSave.url, { wordsPerMinute: 250 });

    let timeOutID = null;
    const timeout = new Promise((resolve, reject) => {
      timeOutID = setTimeout(() => {
        resolve("timedOut");
      }, 10000);
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
  if (article?.tags) {
    console.log("cacheArticle, tags", JSON.stringify(article.tags));
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
  console.log("dataToSave.tags", dataToSave.tags);

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
