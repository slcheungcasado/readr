import yup from "yup";
import prisma from "../controllers/_helpers/prisma.js";

export const signUpSchema = yup.object({
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

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export const wishlistCreateSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
});

export const wishlistUpdateSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
});

export const validationConfigs = {
  abortEarly: false,
  stripUnknown: true,
};
