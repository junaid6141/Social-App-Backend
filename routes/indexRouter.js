const router = require('express-promise-router')();

const adminRouter = require('./admin/adminRouter');
const userRouter = require('./user/userRouter');

router.use('/admin', adminRouter);
router.use('/user', userRouter);

module.exports = router;
