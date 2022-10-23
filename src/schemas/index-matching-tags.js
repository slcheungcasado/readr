import yup from "yup";

export default yup.object({
  tagName: yup.string().label("Search Tag Name"),
});
