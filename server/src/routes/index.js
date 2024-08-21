import express from "express";

import authenticate from "#middlewares/authenticate";

import auth from "#routes/auth.route";
import admin from "#routes/admin.route";
// import procurement from "#routes/procurement.route";
// import warehouse from "#routes/warehouse.route";
// import notification from "#routes/notification.route";

let router = express.Router();

router.use("/auth", auth);
router.use("/admin", authenticate, admin);
// router.use("/procurement", authenticate, procurement);
// router.use("/warehouse", authenticate, warehouse);
// router.use("/notification", authenticate, notification);

router.get("/test", authenticate, async (req, res, next) => {
  res.status(200).json(req.currentUser);
});

export default router;
