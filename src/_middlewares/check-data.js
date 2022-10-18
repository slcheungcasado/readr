import handleErrors from "../controllers/_helpers/handle-errors.js";
import { validationConfigs } from "../schemas/data-schemas.js";

export function checkData(schema) {
  return async function (req, res, next) {
    try {
      const { body } = req;
      req.verifiedData = await schema.validate(body, validationConfigs);
      console.log("Passes the validation schema");
      return next();
    } catch (err) {
      console.log("Fails the validation schema");
      return handleErrors(res, err);
    }
  };
}
