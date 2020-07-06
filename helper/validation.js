const Users = require("../model/Users");
const DB = require("../model/db");

validate = async (data) => {

    if (data.firstName.length > 15) {
        return msg = 'First name should be less than 15 character'
    }
    if (data.email.length > 50) {
        return msg = 'Email length should be less than 50'
    }
    if (data.password.length <= 8) {
        return msg = 'Password must be greater then 8 character'
    }

    let checkCapsInPassword = hasUpperCase(data.password)
    if (!checkCapsInPassword) {
        return msg = 'Password must contain one capital letter'
    }
    if (data.password !== data.confirmPassword) {
        return msg = 'Password not match'
    }
    const user = await Users.getUserByEmail(DB.pool, data.email)
    if (user.rows.length === 1) {
        return msg = 'Email already exist'
    }
}
function hasUpperCase(str) {
    return str.toLowerCase() != str;
}
module.exports = {
    validate: validate
}

