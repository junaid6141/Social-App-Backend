const router = require("express-promise-router")();
const DB = require("../../model/db");
const Users = require("../../model/Users");
const Content = require("../../model/Content");

const addUserContent = async (req, res) => {

    try {
        const response = await Content.addContent(DB.pool, req.body.file_hash, req.body.thumbnail_hash, req.body.file_name, req.body.file_type, req.body.file_category, req.body.user_id)
        if (response.onchainReceipt === true) {
            res.status(200).send({
                newContentDetails: response,
                success: true,
                msg: "Content added successfully"
            });
        } else {
            res.status(400).send({
                error: response,
                msg: "Content not added",
                success: false
            });
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send({
            error: e,
            msg: 'Add content fail',
            success: false
        });
    }
}

const shareContentUser = async (req, res) => {

    try {
        const response = await Content.addShareContent(DB.pool, req.body.contentID, req.body.ownerID, req.body.shareUserID, req.body.viewAccess, req.body.accessType, req.body.expiryTime);
        if (response.onchainReceipt === true) {
            res.status(200).send({
                newContentDetails: response,
                success: true,
                msg: "Content added successfully"
            });
        } else {
            res.status(400).send({
                error: response,
                msg: "Content not added",
                success: false
            });
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send({
            msg: 'Add content fail',
            success: false
        });
    }
}

const getUserContent = async (req, res) => {
    try {
        const response = await Content.getSpecificUserContent(DB.pool, req.query.id)
        res.status(200).send({
            content: response.rows,
            success: true,
            msg: "Request successfully executed"
        });
    }
    catch (e) {
        res.status(500).send({
            error: e,
            msg: 'Request failed',
            success: false
        });
    }
}

router.post("/addContent", addUserContent)
router.post("/shareContent", shareContentUser)
router.get("/getUserContent", getUserContent)

module.exports.contentRouter = router;
