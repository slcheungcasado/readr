import yup from "yup";

export default yup.object({
  tagName: yup.string().label("Search Tag Name"),
  currTags: yup.mixed().optional(),
  showMine: yup.boolean().optional(),
});
