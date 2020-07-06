const router = require("express-promise-router")();
const DB = require("../../model/db");
const bcrypt = require("bcrypt");
const Auth = require("../../model/Auth");
var jwt = require("jsonwebtoken");
const jwtSecret = require('../../config')

const adminLogin = async (req, res) => {
    try {
        const users = await Auth.adminLogin(DB.pool, req.body.email);
        if (users.rowCount === 0) {
            res.status(400).send({
                error: users,
                msg: "User record not found",
                success: false
            });
        } else {
            bcrypt.compare(req.body.password, users.rows[0].password, function (
                err,
                response
            ) {
                if (response) {
                    res.send({
                        token: jwt.sign({
                            id: users.id
                        }, jwtSecret.jwt.secret),
                        msg: "Authorized User",
                        success: true
                    });
                } else {
                    res.status(401).send({
                        error: response,
                        msg: "Unauthorized User",
                        success: false
                    });
                }
            });
        }

    } catch (e) {
        console.error(e);
        res.status(500).send({
            error: e,
            msg: "Internal Server Error",
            success: false
        });
    }
}

router.post("/login", adminLogin);

module.exports.authRouter = router;