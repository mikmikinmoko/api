import express from "express";

// import data from "#controllers/admin/data.controller";
import users from "#controllers/admin/users.controller";
import admin from "#controllers/admin/membership.controller";
import stall from "#controllers/admin/stall.controller";
import parking from "#controllers/admin/parking.controller";
import dashboard from "#controllers/admin/dashboard.controller";
// import parking from "#controllers/admin/parking.controller";
// import products from "#controllers/admin/products.controller";
// import profile from "#controllers/admin/profile.controller";
// import suppliers from "#controllers/admin/suppliers.controller";

const router = express.Router();

// router.use('/data', data)
router.use("/users", users);
router.use("/dashboard", dashboard);
router.use("/membership", admin);
router.use("/stall", stall);
router.use("/parking", parking);
// router.use('/products', products)
// router.use('/profile', profile)
// router.use('/suppliers', suppliers)

export default router;
