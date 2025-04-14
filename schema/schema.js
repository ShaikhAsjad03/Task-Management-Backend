import Joi from "joi";
import joiSchemaValidation from "../middleware/JoiValidation.js";

const userRegisterationSchema=async(req,res,next)=>{
    const schema=Joi.object({
        email: Joi.string()
      .email()
      .required()
      .messages({
        "string.pattern.base": "Enter a valid email address",
        "any.required": "Email is required",
      }),

      fullname: Joi.string()
      .pattern(/^[A-Za-z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "Full name must contain only letters and spaces",
        "any.required": "Full name is required",
      }),

      password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),

      confirmpassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match with confirm password",
        "any.required": "Confirm password is required",
      }),

      mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile must be a 10-digit number",
        "any.required": "Mobile is required",
      }),
    })

    await joiSchemaValidation(schema, req, next);
}


const userloginSchema=async(req,res,next)=>{
  const schema=Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
      "string.pattern.base": "Enter a valid email address",
      "any.required": "Email is required",
    }),

    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),
  })

  await joiSchemaValidation(schema, req, next);
}


const categorySchema=async(req,res,next)=>{
  const schema=Joi.object({
    name:Joi.string().required().messages({
      "string.base": "Category name must be a string",
      "any.required": "Category name is required",
    }),
  })
  await joiSchemaValidation(schema, req, next);
}


const taskSchema=async(req,res,next)=>{
  const schema=Joi.object({
    title:Joi.string().required().messages({
      "string.base": "title must be a string",
      "any.required": "title  is required",
    }),

    categoryId:Joi.string().required().messages({
      "string.base": "categoryId  must be a string",
      "any.required": "categoryId  is required",
    }),

    image:Joi.string().optional().allow("").messages({
      "string.base": "categoryId  must be a string",
      "any.required": "categoryId  is required",
    }),

    description:Joi.string().optional().allow("").messages({
      "string.base": "title must be a string",
      "any.required": "title  is required",
    }),
    deadline: Joi.date().required().messages({
      "date.base": "Deadline must be a valid date",
      "any.required": "Deadline is required",
    }),
    status: Joi.string()
      .valid("pending", "processing", "completed")
      .optional()
      .messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: pending, processing, completed",
      }),


  })

  await joiSchemaValidation(schema, req, next);
}
export {
  userRegisterationSchema,
  userloginSchema,
  categorySchema,
  taskSchema
}