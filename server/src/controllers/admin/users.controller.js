import express from "express";
import moment from "moment-timezone";
import { createId } from "@paralleldrive/cuid2";

import hash from "#helpers/hash";
import { checkPermission } from "#helpers/permissions";
import { addUser, editUser } from "#validations/admin/users.validation";

const router = express.Router();

const MODULE = {
  module: "ADMIN",
  submodule: "USERS",
};

router.get(
  "/getUsers",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    try {
      let result = await req.db.query(`
        SELECT
          accountId,
          firstName,
          middleName,
          lastName,
          birthDate,
          sex,
          regionId,
          provinceId,
          cityId,
          brgyId
          FROM citizen_signup 
          JOIN credentials C USING(accountId)
      `);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/addUser",
  // checkPermission(MODULE, "write"),
  addUser(),
  async (req, res, next) => {
    const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
    const { firstName, lastName, username, password } = req.body;

    let transaction;
    try {
      let result = await req.db.query(
        `
        SELECT *
        FROM credentials
        WHERE username = ?
      `,
        username
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

      // let [insertUser] = await transaction.query(
      //   `
      //   INSERT INTO tbl_users
      //   SET ?
      // `,
      //   {
      //     accountId: accountId,
      //     firstName,
      //     lastName,
      //     dateCreated: date,
      //     dateUpdated: date,
      //   }
      // );

      // if (!insertUser.insertId) {
      //   throw new Error("An error occurred while inserting data");
      // }

      let [insertCreds] = await transaction.query(
        `
        INSERT INTO credentials
        SET ?
      `,
        {
          accountId: accountId,
          username,
          password: hashPassword,
          dateCreated: date,
          dateUpdated: date,
        }
      );

      if (!insertCreds.insertId) {
        throw new Error("An error occurred while inserting data");
      }

      await req.db.commit(transaction);

      res.status(200).json({ message: "Added successfully" });
    } catch (err) {
      await req.db.rollback(transaction);
      next(err);
    }
  }
);

router.post(
  "/editUser/:accountId",
  // checkPermission(MODULE, "write"),
  editUser(),
  async (req, res, next) => {
    const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
    const { accountId } = req.params;

    try {
      let result = await req.db.query(
        `
        SELECT *
        FROM citizen_signup
        WHERE accountId = ?
      `,
        accountId
      );

      if (result.length > 0) {
        let update = await req.db.query(
          `
          UPDATE citizen_signup
          SET ?
          WHERE accountId = ?
        `,
          [
            {
              ...req.body,
              dateUpdated: date,
            },
            accountId,
          ]
        );

        if (update.affectedRows > 0) {
          res.status(200).json({ message: "Updated Successfully" });
        } else {
          res.status(500).json({
            error: 500,
            message: "An error occurred while updating data",
          });
        }
      } else {
        res.status(500).json({
          error: 500,
          message: "An error occurred. Please try again",
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
