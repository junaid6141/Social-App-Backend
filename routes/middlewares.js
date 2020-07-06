var jwt = require("jsonwebtoken");
var router = require("express-promise-router");

const jwtSecret = require('../config')

function ensureWebToken(req, res, next) {
    const { authorization } = req.headers;
    try {
        jwt.verify(authorization, jwtSecret.jwt.secret);
        const { id,email } = jwt.decode(authorization);
        req.user = { id :id,email:email};
        next();
    } catch (e) {
        res.status(401).send();
    }
}

module.exports = {
    ensureWebToken: ensureWebToken
};




