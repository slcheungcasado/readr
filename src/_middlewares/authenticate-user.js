const authenticateUser = (format) => (req, res, next) => {
  if (!req.session?.user?.id) {
    if (format === "json") return res.status(401).json("Please log in First!");
    if (format === "html")
      return res.render("not-permitted", { info: "Please log in first!" });
  }
  return next();
};

export default authenticateUser;
