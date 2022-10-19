import yup from "yup";
import prisma from "../controllers/_helpers/prisma.js";
import { SUPPORTED_FORMATS } from "./data-schemas.js";

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
  username: yup.string().label("Username"),
  avatar: yup
    .mixed()
    .test({
      message: () => "File size is too large (max size: 1 MB)",
      test: (value) => !value || value?.size < 1024 * 1024,
    })
    .test({
      message: () => "Supported File Formats: .jpg, .jpeg, .png",
      test: (value) =>
        !value || (value && SUPPORTED_FORMATS.includes(value.mimetype)),
    }),
});
