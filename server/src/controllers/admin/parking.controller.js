import express from "express";
import moment from "moment-timezone";
import { createId } from "@paralleldrive/cuid2";

import hash from "#helpers/hash";
import { checkPermission } from "#helpers/permissions";
import { checkParking } from "#validations/admin/parking.validation";

const router = express.Router();

const module = {
  module: "ADMIN",
  submodule: "USERS",
};

router.get(
  "/getParking",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    try {
      let result = await req.db.query(`
        SELECT 
          CP.vehicleType,
          CP.plateNumber,
          CP.rate,
          CP.dateStarted,
          CI.firstName,
          CI.middleName,
          CI.lastName,
          CI.mobileNumber
        FROM 
          citizen_parking CP
        LEFT JOIN citizen_info CI USING(accountId)
      `);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  "/getApprovedMember",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    try {
      let result = await req.db.query(`
        SELECT 
          id,
          accountId,
          CONCAT(
          firstName,
          CASE WHEN middleName IS NOT NULL THEN
            CONCAT(" ", middleName)
            ELSE ""
          END, " ", lastName
          ) AS fullName
        FROM 
          citizen_info
        WHERE status = 1
      `);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/addParking",
  // checkPermission(MODULE, "write"),
  checkParking(),
  async (req, res, next) => {
    const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");

    let transaction;
    try {
      // let result = await req.db.query(
      //   `
      //   SELECT *
      //   FROM citizen_info
      //   WHERE accountId = ?
      // `,
      //   req.body.accountId
      // );

      // if (result.length > 0) {
      //   return res.status(400).json({
      //     error: 400,
      //     message: "Account already exists",
      //   });
      // }

      transaction = await req.db.beginTransaction();

      let [parking] = await transaction.query(
        `
        INSERT INTO citizen_parking
        SET ?
      `,
        {
          ...req.body,
          dateCreated: date,
          dateUpdated: date,
        }
      );

      if (!parking.insertId) {
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

// router.get(
//   "/getPending/:status",
//   // checkPermission(MODULE, "read"),
//   async (req, res, next) => {
//     const { status } = req.params;
//     try {
//       let result = await req.db.query(
//         `
//         SELECT
//           accountId,
//           firstName,
//           middleName,
//           lastName,
//           mobileNumber,
//           birthDate,
//           sex,
//           status,
//           dateCreated,
//           dateUpdated
//         FROM
//           citizen_info
//         WHERE
//           status = ?
//       `,
//         [status]
//       );

//       res.status(200).json(result);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// router.post(
//   "/acceptMember/:accountId",
//   // checkPermission(module, "write"),
//   acceptMember(),
//   async (req, res, next) => {
//     const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
//     const { accountId } = req.params;
//     const values = req.body;
//     console.log(values);

//     try {
//       let result = await req.db.query(
//         `
//         SELECT *
//         FROM citizen_info
//         WHERE accountId = ?
//       `,
//         [accountId]
//       );

//       if (result.length == 0) {
//         return res.status(500).json({
//           error: 500,
//           message: "Record doesn't exist.",
//         });
//       }

//       let update = await req.db.query(
//         `
//         UPDATE citizen_info
//         SET ?
//         WHERE accountId = ?
//       `,
//         [
//           {
//             status: 1,
//             dateUpdated: date,
//           },
//           accountId,
//         ]
//       );

//       if (update.affectedRows == 0) {
//         return res.status(500).json({
//           error: 500,
//           message: "An error occurred while updating data",
//         });
//       }

//       let taxes = await req.db.query(
//         `
//         INSERT INTO citizen_taxes
//         SET ?
//         `,
//         [
//           {
//             ...req.body,
//             accountId: accountId,
//             dateCreated: date,
//             dateUpdated: date,
//           },
//         ]
//       );

//       if (!taxes.insertId) {
//         throw new Error("An error occurred while inserting data");
//       }

//       return res.status(200).json({ message: "Accepted Successfully" });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// router.post(
//   "/viewProfile/:accountId",
//   // checkPermission(module, "write"),
//   // editMember(),
//   async (req, res, next) => {
//     // const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
//     const { accountId } = req.params;

//     try {
//       let result = await req.db.query(
//         `
//         SELECT *
//         FROM citizen_info
//         WHERE accountId = ?
//       `,
//         [accountId]
//       );

//       if (result.length > 0) {
//         res.status(200).json(result[0]);
//       } else {
//         res.status(404).json({ message: "Account not found" });
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );
// router.post(
//   "/editMember/:accountId",
//   // checkPermission(module, "write"),
//   editMember(),
//   async (req, res, next) => {
//     const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
//     const { accountId } = req.params;
//     const { username, ...newVal } = req.body;
//     console.log(newVal);

//     try {
//       let result = await req.db.query(
//         `
//         SELECT *
//         FROM citizen_info
//         WHERE accountId = ?
//       `,
//         [accountId]
//       );

//       if (result.length > 0) {
//         let update = await req.db.query(
//           `
//           UPDATE citizen_info
//           SET ?
//           WHERE accountId = ?
//         `,
//           [
//             {
//               ...newVal,
//               dateUpdated: date,
//             },
//             accountId,
//           ]
//         );

//         let checkUsername = await req.db.query(
//           `
//         SELECT
//           username
//         FROM credentials
//         WHERE username = ?
//       `,
//           username
//         );

//         if (checkUsername.length > 0) {
//           return res.status(400).json({
//             error: 400,
//             message: "Username already exists",
//           });
//         }

//         if (update.affectedRows > 0) {
//           res.status(200).json({ message: "Updated Successfully" });
//         } else {
//           res.status(500).json({
//             error: 500,
//             message: "An error occurred while updating data",
//           });
//         }
//       } else {
//         res.status(500).json({
//           error: 500,
//           message: "An error occurred. Please try again",
//         });
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export default router;
