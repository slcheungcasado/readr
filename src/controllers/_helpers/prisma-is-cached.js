import prisma from "./prisma.js";
import { cacheArticle } from "./prisma-cache-article.js";

export async function cacheIfNeeded(article) {
  try {
    const foundArticle = await prisma.article.findUnique({
      where: { url: article.link },
      rejectOnNotFound: true,
    });
    // console.log("Cache Hit");
    return foundArticle;
  } catch (err) {
    // console.log("Cache Miss");
    // console.log("article.title", article.title);
    return cacheArticle(article);
  }
}
