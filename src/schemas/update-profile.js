import yup from "yup";

export default yup.object().shape(
  {
    email: yup.string().email(),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    newPassword: yup
      .string()
      .nullable()
      .notRequired()
      .when("newPassword", {
        is: (value) => value?.length,
        then: (rule) =>
          rule
            .min(6, "New password must be at least 6 characters")
            .notOneOf(
              [yup.ref("password")],
              "New Password cannot be the same as the current password"
            ),
      }),
    newPasswordConfirmation: yup.string().when("newPassword", {
      is: (pass) => pass?.length >= 6,
      then: yup
        .string()
        .oneOf([yup.ref("newPassword"), null], "New Passwords must match")
        .required(),
      otherwise: yup.string().notRequired(),
    }),
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
  },
  [["newPassword", "newPassword"]]
);
