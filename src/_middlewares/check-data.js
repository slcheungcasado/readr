import handleErrors from "../controllers/_helpers/handle-errors.js";
import { validationConfigs } from "../schemas/data-schemas.js";

export function checkData(schema) {
  return async function (req, res, next) {
    try {
      const { body } = req;
      console.log("body.username", body.username);
      req.verifiedData = await schema.validate(body, validationConfigs);
      console.log("req.verifiedData.username", req.verifiedData.username);
      return next();
    } catch (err) {
      return handleErrors(res, err);
    }
  };
}
