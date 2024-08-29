import { body, param } from "express-validator";
import validate from "#middlewares/validate";

export const register = () => {
  return [
    body([
      "firstName",
      "lastName",
      "birthDate",
      "mobileNumber",
      "sex",
      "brgyId",
      "cityId",
      "provinceId",
      "brgyId",
      "username",
      "password",
    ])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};

export const editUser = () => {
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
      "sex",
      "regionId",
      "provinceId",
      "cityId",
      "brgyId",
    ])
      .notEmpty()
      .withMessage("This field is required")
      .trim()
      .escape(),
    (req, res, next) => validate(req, res, next),
  ];
};