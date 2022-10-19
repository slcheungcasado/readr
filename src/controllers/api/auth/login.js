import handleErrors from "../../_helpers/handle-errors.js";
import passport from "../../../_middlewares/passport.js";

const authenticate = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).end(err.toString());
    if (!user) return res.status(401).json(info);

    req.session.user = { id: user.id };
    await req.session.save();
    return res.status(200).json(user);
  })(req, res, next);
};

export default async function (req, res, next) {
  try {
    return authenticate(req, res, next);
  } catch (err) {
    return handleErrors(res, res);
  }
}
