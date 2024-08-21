import express from "express";

// import data from "#controllers/admin/data.controller";
import users from "#controllers/admin/users.controller";
// import products from "#controllers/admin/products.controller";
// import profile from "#controllers/admin/profile.controller";
// import suppliers from "#controllers/admin/suppliers.controller";

const router = express.Router();

// router.use('/data', data)
router.use("/users", users);
// router.use('/products', products)
// router.use('/profile', profile)
// router.use('/suppliers', suppliers)

export default router;
