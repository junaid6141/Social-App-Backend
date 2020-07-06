const DB = require("./db");
const ServerCrypto = require('../helper/crypto');

async function addEncryptedKeyToOffChain(client, rsaKey, newContentID) {
    try {
        let encryptedNewKey = await ServerCrypto.serverEncryption(rsaKey.toString());

        let response = await DB.insertIntoQueryWithClient(client, "keyContent", {
            file_encrypted_key: encryptedNewKey,
            content_id: newContentID
        }, ['id']);

        return response;
    } catch (e) {
        return e.message;
    }
}

async function getContentKey(client, contentID) {
    try {
        let response = await client.query(`SELECT * from ${DB.tables.keyContent} where content_id = ${contentID}`);
        return response;
    } catch (e) {
        return e.message;
    }
}

module.exports = {
    addEncryptedKeyToOffChain: addEncryptedKeyToOffChain,
    getContentKey: getContentKey
};