import yup from "yup";
import prisma from "../controllers/_helpers/prisma.js";

export default yup.object({
  email: yup
    .string()
    .email()
    .required()
    .test({
      message: () => "Email already exists",
      test: async (value) => {
        try {
          await prisma.users.findUnique({
            where: { email: value },
            rejectOnNotFound: true,
          });
          return false;
        } catch (err) {
          return true;
        }
      },
    }),
  password: yup.string().min(6).required(),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required(),
});
