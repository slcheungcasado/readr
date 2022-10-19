import prisma from "../../../_helpers/prisma.js";
import handleErrors from "../../../_helpers/handle-errors.js";
import _ from "lodash";

export default async function (req, res) {
  try {
    const {
      session: {
        user: { id },
      },
    } = req;

    const foundUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      rejectOnNotFound: true,
    });
    return res.status(200).json(_.omit(foundUser, ["passwordHash"]));
  } catch (err) {
    return handleErrors(res, err);
  }
}
