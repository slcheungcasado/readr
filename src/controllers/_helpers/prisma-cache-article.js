import { extract } from "article-parser";

import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";

async function runArticleParser(url, dataToSave, { needHTML = false } = {}) {
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
    const data = await extract(article.url);
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
    console.error(err);
    // throw Error('Error, could not extract article details');
    dataToSave.description = data?.description || "";
    dataToSave.image = data?.image || "";
    if (needHTML) dataToSave.content = "<h1>Not Available</h1>";
    dataToSave.author = data?.author || "";
    dataToSave.source = data?.source || "";
    dataToSave.readingTime = data?.ttr || 0;
    return dataToSave;
  }
  return dataToSave;
}

function runReadability(doc, dataToSave) {
  // From JSDOM.fromURL() + Readability
  // {
  //   descriptionShort: data.excerpt,
  //   content: data.content, (best html parsing)
  // }
  const data = new Readability(doc).parse();
  if (!data) {
    return dataToSave;
  }
  dataToSave.content = data.content;
  return dataToSave;
}

export async function cacheArticle(article) {
  if (article?.url) {
    return {};
  }

  // From GNews API Call
  const dataToSave = {
    title: article?.title,
    url: article.url,
    pubDate: article.pubDate,
    relatedLinks: article.content,
  };

  // Article Parsing (Preparing data for Prisma)
  const doc = await JSDOM.fromURL(article.url);
  if (isProbablyReaderable(doc)) {
    dataToSave = runReadability(doc, dataToSave);
    dataToSave = runArticleParser(article.url, dataToSave, { needHTML: false });
  } else {
    dataToSave = runArticleParser(article.url, dataToSave, { needHTML: true });
  }

  // expected data
  // const preparedData = {
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
}
