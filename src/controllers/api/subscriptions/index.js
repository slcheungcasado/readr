import prisma from "../../_helpers/prisma.js";
import handleErrors from "../../_helpers/handle-errors.js";

export default async function (req, res) {
  try {
    return res.status(200).json({ subscriptions: {}, meta: {} });
  } catch (err) {
    handleErrors(res, err);
  }
}
