import handleErrors from "../controllers/_helpers/handle-errors.js";
import { validationConfigs } from "../schemas/schema-validation-configs.js";

export function checkData(schema) {
  return async function (req, res, next) {
    try {
      console.log(req.body);
      const { body } = req;
      req.verifiedData = await schema.validate(body, validationConfigs);
      console.log("Data passes validation");
      return next();
    } catch (err) {
      console.log("Data fails validation");
      return handleErrors(res, err);
    }
  };
}
