import express from "express";
import moment from "moment-timezone";
import { createId } from "@paralleldrive/cuid2";

import hash from "#helpers/hash";
import { checkPermission } from "#helpers/permissions";
import { checkLoan } from "#validations/admin/loan.validation";

const router = express.Router();

const module = {
  module: "ADMIN",
  submodule: "USERS",
};

router.get(
  "/getLoans",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    try {
      let result = await req.db.query(`
        SELECT 
          CL.accountId,
          CL.loanId,
          CL.amount,
          CL.term,
          CL.status as loanStatus,
          CL.dateAccepted as loanAprroved,
          CI.firstName,
          CI.middleName,
          CI.lastName
        FROM 
         citizen_loan CL
        LEFT JOIN citizen_info CI USING(accountId)
      `);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/getLoan/:accountId",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    const { accountId } = req.params;
    try {
      let result = await req.db.query(
        `
        SELECT 
          CL.*
          CI.firstName,
          CI.middleName,
          CI.lastName,
          CS.section as stallNo
        FROM 
         citizen_loan CL
        LEFT JOIN citizen_info CI USING(accountId)
        LEFT JOIN citizen_stall CS USING(accountId)
        WHERE
          CL.accountId = ?
      `,
        [accountId]
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/getMembers",
  // checkPermission(MODULE, "read"),
  async (req, res, next) => {
    try {
      let result = await req.db.query(`
        SELECT
          DISTINCT CI.accountId,
          CI.firstName,
          CI.middleName as middleName,
          CI.lastName,
          COALESCE(CS.section) as section
        FROM citizen_info CI
        LEFT JOIN citizen_stall CS USING(accountId)
        WHERE status = 1
      `);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/addLoan",
  // checkPermission(MODULE, "write"),
  checkLoan(),
  async (req, res, next) => {
    const date = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
    const { accountId } = req.body;

    let transaction;
    try {
      const checked = await req.db.query(
        `
        SELECT
          *
        FROM citizen_loan CL
        LEFT JOIN citizen_info CI USING(accountId) 
        WHERE
          CL.accountId = ? AND
          CI.status = 1
        `,
        [accountId]
      );

      if (checked.length > 0) {
        return res.status(409).send({
          message: "You've Already Applied for Loan, Please settle your loan",
        });
      }

      const loanId = createId().toUpperCase();
      transaction = await req.db.beginTransaction();

      let [loan] = await transaction.query(
        `
        INSERT INTO citizen_loan
        SET ?
      `,
        {
          ...req.body,
          loanId: loanId,
          dateAccepted: date,
          dateCreated: date,
          dateUpdated: date,
          status: 0,
        }
      );

      if (!loan.insertId) {
        throw new Error("An error occurred while inserting data");
      }

      await req.db.commit(transaction);

      res.status(201).json({ message: "Loan application added successfull" });
    } catch (err) {
      if (transaction) await req.db.rollback(transaction);
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
