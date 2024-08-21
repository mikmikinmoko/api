import express from 'express';

import auth from '#controllers/auth.controller'

var router = express.Router()

router.use('/', auth)

export default router;
