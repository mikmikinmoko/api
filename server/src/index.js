import express from "express";

import routes from "#routes";
import { isEmpty } from "lodash";
import sanitizeHtml from "sanitize-html";
import he from "he";

let router = express.Router();
function convertEmptyStringToNull(obj) {
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = convertEmptyStringToNull(obj[i]);
    }
  } else if (obj instanceof Object) {
    Object.keys(obj).forEach((key) => {
      if (!isEmpty(obj.firstName)) {
        obj.firstName = `${obj.firstName || ""}`.replace(/[^a-zA-Z ñÑ]+/g, "");
      }
      if (!isEmpty(obj.middleName)) {
        obj.middleName = `${obj.middleName || ""}`.replace(
          /[^a-zA-Z ñÑ]+/g,
          ""
        );
      }
      if (!isEmpty(obj.lastName)) {
        obj.lastName = `${obj.lastName || ""}`.replace(/[^a-zA-Z ñÑ]+/g, "");
      }
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (obj[key] === "") {
        obj[key] = null;
      } else if (obj[key] instanceof Object || obj[key] instanceof Array) {
        obj[key] = convertEmptyStringToNull(obj[key]);
      }
    });
  }

  return obj;
}
function encodeWithIgnoredEntities(input) {
  const parts = input.split(/(&[^;]*;)/g);
  const encodedParts = parts.map((part) => {
    // Check if the part is already an HTML entity
    if (/^&[^;]*;$/.test(part)) {
      return part;
    }
    // Encode the part if it's not already an entity
    return he.encode(part);
  });

  return encodedParts.join("");
}

function purifyReqBody(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
      obj[key] = sanitizeHtml(obj[key]);
      obj[key] = encodeWithIgnoredEntities(obj[key]);
    }
  });

  return obj;
}

router.use((req, res, next) => {
  if (req.method == "POST") {
    req.body = convertEmptyStringToNull(req.body);
    req.body = purifyReqBody(req.body);
  }

  next();
});

router.use("/api", routes);

export default router;
