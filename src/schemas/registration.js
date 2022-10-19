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
          await prisma.user.findUnique({
            where: { email: value },
            rejectOnNotFound: true,
          });
          return false;
        } catch (err) {
          return true;
        }
      },
    })
    .label("Email"),
  password: yup.string().min(6).required().label("Password"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required()
    .label("Password Confirmation"),
});
