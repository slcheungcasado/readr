import handleErrors from "../../_helpers/handle-errors.js";
import prisma from "../../_helpers/prisma.js";
import bcrypt from "bcrypt";
import _ from "lodash";
import uploadFileAsync from "../../_helpers/upload-file.js";

export default async function (req, res) {
  try {
    const { verifiedData } = req;
    const dataToSave = {
      email: verifiedData.email,
      passwordHash: await bcrypt.hash(verifiedData.password, 10),
      avatar: verifiedData?.avatar || null,
    };
    // console.log("verifiedData", verifiedData);
    // console.log("verifiedData.username", verifiedData.username);
    if (verifiedData?.username) {
      dataToSave.username = verifiedData.username;
    }

    if (verifiedData.avatar) {
      await uploadFileAsync(verifiedData, req);
      dataToSave.avatar = verifiedData.avatar;
    }

    //every user should have one reading list by default
    dataToSave.readingList = {
      create: { title: "My List" },
    };

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
