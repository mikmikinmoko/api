import {} from "dotenv/config";

import express from "express";
import logger from "morgan";
import moment from "moment";
import Database from "./database";
import APIError from "#helpers/APIError";
import api from "#src";

import compression from "compression";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
const app = express();
const db = new Database();

if (process.env.NODE_ENV == "development") {
  app.use(logger("dev"));
} else {
  app.use(
    logger("dev", {
      skip: function (req, res) {
        return res.statusCode <= 400;
      },
    })
  );
}
app.set("view engine", "ejs");
app.set("json replacer", function (key, value) {
  if (this[key] instanceof Date) {
    if (this[key].getHours() === 0) {
      // If getHours() returns 0, it's a Date (no time component)
      value = moment(this[key]).format("YYYY-MM-DD");
    } else {
      // If getHours() is greater than 0, it's a Datetime (has a time component)
      value = moment(this[key]).format("YYYY-MM-DD HH:mm:ss");
    }
  }

  return value;
});
// let corsAllowedList = JSON.parse(process.env.corsAllowedList);
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (corsAllowedList.indexOf(req.header("Origin")) !== -1) {
    corsOptions = {
      origin: true,
      methods: ["GET", "PUT", "POST"],
    }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// app.use(cors(corsOptionsDelegate));
app.use(cors());
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["self"],
        scriptSrc: ["self"],
        styleSrc: ["self"],
        imgSrc: ["self", "data:"],
      },
    },
    hsts: {},
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "same-origin" },
    permittedCrossDomainPolicies: {},
    expectCt: {},
  })
);
app.use(hpp());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.set("json spaces", 2);
app.set("case sensitive routing", false);
app.set("strict routing", true);
app.set("x-powered-by", false);
app.disable("etag");

app.use("/public", express.static("public"));

app.use((req, res, next) => {
  req.db = db;
  next();
});
app.use(api);

app.use((err, req, res, next) => {
  if (!(err instanceof APIError)) {
    if (process.env.NODE_ENV === "development") {
      const apiError = new APIError(err.message, err.status, err.isPublic);
      return next(apiError);
    } else {
      const apiError = new APIError("Internal Server Error", 500, false);
      return next(apiError);
    }
  }
  return next(err);
});

app.use((req, res, next) => {
  const err = new APIError("API not found", 404);
  return next(err);
});

app.use((err, req, res, next) =>
  res.status(err.status).json({
    // message: err.isPublic ? err.message : err.status,
    message: err.isPublic ? err.message : "An unexpected error occurred",
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  })
);

export default app;
