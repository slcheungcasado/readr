import yup from "yup";
import prisma from "../controllers/_helpers/prisma.js";

export default yup.object({
  articleId: yup
    .number()
    .required()
    .test({
      message: "No matching article found.",
      test: async (value) => {
        try {
          await prisma.readingList.findUnique({
            where: { id: value },
            rejectOnNotFound: true,
          });
          return true;
        } catch (err) {
          return false;
        }
      },
    }),
});
