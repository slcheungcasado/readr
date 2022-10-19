import bcrypt from "bcrypt";
import _ from "lodash";

import handleErrors from "../../../_helpers/handle-errors.js";
import updateProfile from "../../../../schemas/update-profile.js";
import prisma from "../../../_helpers/prisma.js";
import { s3 } from "../../../_helpers/s3-client.js";
import uploadFileAsync from "../../../_helpers/upload-file.js";

export default async function (req, res) {
  try {
    const {
      session: {
        user: { id },
      },
      body,
    } = req;

    const verifiedData = await updateProfile.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const dataToSave = {
      email: "",
      passwordHash: "",
      avatar: "",
    };

    //#BUG: Error feedback for Error(...) do not show
    try {
      const currData = await prisma.user.findUnique({ where: { id } });

      if (!(await bcrypt.compare(verifiedData.password, currData.passwordHash)))
        return handleErrors(res, new Error("Incorrect password"));

      if (
        verifiedData?.email &&
        verifiedData.email !== currData.email &&
        !(await isUniqueUserEmail(verifiedData.email))
      ) {
        // console.log("This happens");
        // throw new Error("Email already taken");
        return handleErrors(res, new Error("Email already taken"));
      } else
        dataToSave.email = verifiedData?.email
          ? verifiedData.email
          : currData.email;

      dataToSave.passwordHash = verifiedData?.newPassword
        ? await bcrypt.hash(verifiedData.newPassword, 10)
        : currData.passwordHash;

      dataToSave.username = verifiedData?.username
        ? verifiedData.username
        : currData.username;

      // assumptions: not checking if the user is re-uploading the same avatar file
      // if file is in another bucket then this would throw an error
      if (verifiedData.avatar) {
        if (currData.avatar) {
          const params = {
            Bucket: process.env.S3_BUCKET,
            Key: currData.avatar.split("/").at(-1),
          };
          try {
            await s3.deleteObject(params).promise();
          } catch (err) {
            return handleErrors(
              res,
              new Error(
                "Internal Server Error: Could not delete existing avatar image"
              )
            );
          }
        }

        await uploadFileAsync(verifiedData, req);
        dataToSave.avatar = verifiedData.avatar;
      } else {
        dataToSave.avatar = currData.avatar;
      }

      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: dataToSave,
      });

      return res.status(200).json(_.omit(updated, ["passwordHash"]));
    } catch (err) {
      return handleErrors(res, err);
    }
  } catch (err) {
    return handleErrors(res, err);
  }
}
