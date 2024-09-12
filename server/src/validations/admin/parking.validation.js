import { body, param } from "express-validator";
import validate from "#middlewares/validate";

export const checkParking = () => {
  return [
    body(["accountId", "vehicleType", "plateNumber", "rate", "dateStarted"])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};

export const editMember = () => {
  return [
    param("accountId")
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    body([
      "firstName",
      "lastName",
      "birthDate",
      "mobileNumber",
      "sex",
      "regionId",
      "provinceId",
      "cityId",
      "brgyId",
      "username",
    ])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};
export const acceptMember = () => {
  return [
    param("accountId")
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    body(["tinNumber"])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};
