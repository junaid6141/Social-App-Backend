const router = require("express-promise-router")();
const jwt = require("jsonwebtoken");
const authRouter = require('./auth.js').authRouter;
const userRouter = require('./user.js').userRouter;


router.use('/auth', authRouter);
router.use('/user', userRouter);

module.exports = router;
