import yup from "yup";

export default yup.object({
  id: yup.number().required().label("Article ID is required"),
  currTags: yup.mixed().optional(),
});
