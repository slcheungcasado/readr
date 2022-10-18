import handleErrors from "../../_helpers/handle-errors.js";
import prisma from "../../_helpers/prisma.js";
import bcrypt from "bcrypt";
import _ from "lodash";

export default async function (req, res) {
  try {
    const { verifiedData } = req;
    const dataToSave = {
      email: verifiedData.email,
      passwordHash: await bcrypt.hash(verifiedData.password, 10),
      avatar: verifiedData?.avatar || null,
    };

    if (verifiedData?.username) {
      dataToSave.username = verifiedData.username;
    }

    const newUser = await prisma.user.create({
      data: dataToSave,
      include: {
        readingList: true,
      },
    });

    req.session.user = { id: newUser.id };
    await req.session.save();

    return res.status(201).json(_.omit(newUser, ["passwordHash"]));
  } catch (err) {
    return handleErrors(res, err);
  }
}
