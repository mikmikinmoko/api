import { check, body, query } from "express-validator";
import validate from "#middlewares/validate";

export const login = () => {
  return [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
      validate(req, res, next);
    },
  ];
};

export const signUp = () => {
  return [
    body([
      "firstName",
      "lastName",
      "regionId",
      "provinceId",
      "cityId",
      "brgyId",
      "username",
      "password",
      "accountType",
    ])
      // body(["firstName", "lastName", "username", "password"])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};

export const forgotPassword = () => {
  return [
    check("firstName")
      .notEmpty()
      .withMessage("FirstName is required")
      .trim()
      .escape(),
    check("lastName")
      .notEmpty()
      .withMessage("LastName is required")
      .trim()
      .escape(),
    check("email")
      .isEmail()
      .notEmpty()
      .withMessage("Invalid email address'")
      .normalizeEmail(),
    check("mobileNumber")
      .isInt()
      .notEmpty()
      .withMessage("Mobile number is required"),
    check("ageGroup").notEmpty().withMessage("Age Group is required"),
    check("sex").isInt().notEmpty().withMessage("Gender is required"),
    check("companyName").notEmpty().withMessage("Company name is required"),
    check("designation").notEmpty().withMessage("Designation is required"),
    check("country")
      .if(body("country").exists())
      .notEmpty()
      .withMessage("Country is required"),
    check("city")
      .if(body("city").exists())
      .notEmpty()
      .withMessage("City is required"),
    check("password").notEmpty().withMessage("password is required"),
    check("confirmPassword")
      .if(body("confirmPassword").exists())
      .notEmpty()
      .withMessage("You must type a confirmation password")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("The passwords do not match"),
    (req, res, next) => {
      validate(req, res, next);
    },
  ];
};

export const resetPassword = () => {
  return [
    check("token").notEmpty().withMessage("Token is  required'"),
    check("password").notEmpty().withMessage("Password is  required'"),
    (req, res, next) => {
      validate(req, res, next);
    },
  ];
};
