const alreadyLoggedIn = (format) => (req, res, next) => {
  if (req.session?.user?.id) {
    if (format === "json") return res.status(401).json("Please log out first!");
    if (format === "html")
      return res.render("not-permitted", { info: "Please log out first!" });
  }
  return next();
};

export default alreadyLoggedIn;
