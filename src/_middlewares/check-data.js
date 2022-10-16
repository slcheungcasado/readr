import handleErrors from "../controllers/_helpers/handle-errors.js";
import { validationConfigs } from "../models/data-schemas.js";

export function checkData(schema) {
  return async function (req, res, next) {
    try {
      const { body } = req;
      req.verifiedData = await schema.validate(body, validationConfigs);
      return next();
    } catch (err) {
      return handleErrors(res, err);
    }
  };
}
