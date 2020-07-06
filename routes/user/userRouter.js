const router = require("express-promise-router")();
const { ensureWebToken } = require("../middlewares");

const contentRouter = require('./content.js').contentRouter;

router.use('/content', contentRouter);

module.exports = router;
