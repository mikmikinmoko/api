import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import hash from "#helpers/hash";
import { login, signUp } from "#validations/auth.validation";
import moment from "moment";
import { createId } from "@paralleldrive/cuid2";
const router = express.Router();

// const encryptedPrivateKey = process.env.jwtSecretKey;

const encryptedPrivateKey = fs.readFileSync(
  path.join(__dirname, "../../../auth-keys/decrypted_private_key.pem"),
  "utf-8"
);

router.post("/login", login(), async (req, res, next) => {
  const { username, password } = req.body;

  try {
    let result = await req.db.query(
      `
      SELECT 
        accountId,
        C.password,
        C.accountType,
        CS.firstName,
        CS.middleName,
        CS.lastName
      FROM credentials C
      LEFT JOIN citizen_signup CS USING(accountID)
      WHERE username = ?
    `,
      username
    );

    if (result.length == 0) {
      return res.status(401).json({
        error: 401,
        message: "Invalid username",
      });
    }

    if (!(await hash.comparePassword(password, result[0].password))) {
      return res.status(401).json({
        error: 401,
        message: "Invalid password",
      });
    }

    const payload = {
      accountId: result[0].accountId,
    };

    const token = jwt.sign(payload, encryptedPrivateKey, {
      algorithm: "RS256",
    });

    return res.status(200).json({ token, ...result[0] });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/signUp", signUp(), async (req, res, next) => {
  const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
  const { accountid, username, password, accountType, ...val } = req.body;

  let transaction;
  try {
    let result = await req.db.query(
      `
        SELECT *
        FROM credentials
        WHERE username = ?
      `,
      [username]
    );

    if (result.length > 0) {
      return res.status(400).json({
        error: 400,
        message: "Username already exists",
      });
    }

    const accountId = createId().toUpperCase();
    const hashPassword = await hash.hashPassword(password);

    transaction = await req.db.beginTransaction();

    let [insertUser] = await transaction.query(
      `
        INSERT INTO citizen_signup
        SET ?
      `,
      {
        ...val,
        accountId: accountId,
        dateCreated: date,
        dateUpdated: date,
      }
    );

    if (!insertUser.insertId) {
      throw new Error(
        "An error occurred while inserting data into citizen_signup"
      );
    }

    let [insertCreds] = await transaction.query(
      `
        INSERT INTO credentials
        SET ?
      `,
      {
        accountId,
        username,
        accountType,
        password: hashPassword,
        dateCreated: date,
        dateUpdated: date,
      }
    );

    if (!insertCreds.insertId) {
      throw new Error(
        "An error occurred while inserting data into credentials"
      );
    }

    await transaction.commit();
    await transaction.release();

    res.status(200).json({ message: "Added successfully" });
  } catch (err) {
    await transaction.rollback();
    await transaction.release();

    next(err);
  }
});

export default router;
