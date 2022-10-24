import handleErrors from "../../../../../_helpers/handle-errors.js";
import prisma from "../../../../../_helpers/prisma.js";

export default async function (req, res) {
  try {
    const userId = req?.session?.user?.id;
    const {
      verifiedData: { tagName = "", currTags = {} },
    } = req;

    const userTags = [];

    for (let [key, value] of Object.entries(currTags)) {
      // console.log(key, value);
      if (key.startsWith("user-tag")) {
        userTags.push(value.toUpperCase());
      }
    }

    const matchingTags = await prisma.tag.findMany({
      where: {
        name: {
          contains: tagName,
          mode: "insensitive",
        },
        NOT: {
          name: { in: userTags },
        },
      },
      orderBy: {
        _relevance: {
          fields: ["name"],
          search: tagName,
          sort: "asc",
        },
      },
      take: 10,
    });

    return res.status(200).json({
      tags: matchingTags,
    });
  } catch (err) {
    return handleErrors(res, err);
  }
}
