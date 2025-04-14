import { deleteImage, fileValidation } from "../helper/common.js";
const joiSchemaValidation = async (schema, req, next) => {
  const data = req.body;

  try {
    if (!data || Object.keys(data).length === 0) {
      if (req.file) await deleteImage(req.file?.path );
      const error = new Error("Invalid or empty request body");
      error.status = 400;
      return next(error);
    }

    const { error, value } = schema.validate(data, {
      abortEarly: true,
      allowUnknown: false,
    });

    if (error) {
      if (req.file) await deleteImage(req.file?.path );
      const validationError = new Error(
        `Validation Error: ${error.details.map((item) => item.message).join(", ")}`
      );
      validationError.status = 400;
      return next(validationError);
    }

    req.body = value;
    next();
  } catch (err) {
    if (req.file) {
      await deleteImage(req.file?.path );
    }
    next(err);
  }
};

export default joiSchemaValidation;
