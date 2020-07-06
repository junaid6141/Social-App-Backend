const DB = require("./db");
const walletModel = require('./Wallet');
const keyContentModel = require('./KeyContent');
const ServerCrypto = require('../helper/crypto');
const EthCrypto = require('../helper/eth-crypto');
const IPFS = require('../helper/ipfs');
const RSACrypto = require('../helper/rsa');
const ContentStorage = require('../helper/content-storage');
const onchainContent = require('../contracts/erc875')
const fs = require('fs');


async function addContent(client, unencryptedContent, unencryptedContentThumbnail, fileName, fileType, fileCategory, user_id) {
    try {
        let walletDetail = await walletModel.getWalletDetail(client, user_id);
        if (walletDetail.rowCount === 1) {
            let newRSAKey = await RSACrypto.generateKey();
            let rsaEncryptedContent = await RSACrypto.rsaEncryption(unencryptedContent, newRSAKey);
            let contentBuffer = new Buffer.from(rsaEncryptedContent, 'base64');

            /*
             * encryptedThumbnailContent - Will be used in production. For development, we are not encrypting thumbnails
             * let encryptedThumbnailContent = await ServerCrypto.serverEncryption(unencryptedContentThumbnail);
             */


            let storageResponse = await ContentStorage.contentStorageToDirectory(rsaEncryptedContent, user_id, fileName + '.jpg');
            let storageThumbnailResponse = await ContentStorage.contentThumbnailStorageToDirectory(unencryptedContentThumbnail, user_id, fileName + '.jpg');

            let ipfsHash = await IPFS.uploadEncryptedFile(contentBuffer);
            let publicKey = await ServerCrypto.serverDecryption(walletDetail.rows[0].public_key);
            let encryptedHash = await EthCrypto.publicKeyEncryption(ipfsHash[0].hash, publicKey);
            let encryptedPath = await ServerCrypto.serverEncryption(storageResponse);
            let encryptedThumbnailPath = await ServerCrypto.serverEncryption(storageThumbnailResponse);

            let onchainReceipt = await onchainContent.addContentOnchain(client, encryptedHash, fileType, user_id);

            if (onchainReceipt.status != true) {
                return ({
                    "msg": "OnChain Transaction failed",
                    "error": onchainReceipt
                })
            }

            let newContentID = await DB.insertIntoQueryWithClient(client, DB.tables.content, {
                file_encrypted_hash: encryptedHash,
                file_name: fileName,
                file_path: encryptedPath,
                thumbnail_file_path: encryptedThumbnailPath,
                file_type: fileType,
                category_id: fileCategory,
                user_id: user_id,
            }, ['id']);

            let newKeyContentID = await keyContentModel.addEncryptedKeyToOffChain(client, newRSAKey, newContentID.rows[0].id)

            return ({
                "newContentID": newContentID.rows[0].id,
                "newKeyContentID": newKeyContentID.rows[0].id,
                "onchainReceipt": onchainReceipt.status
            })
        } else {
            return ({
                "msg": "Wallet details not found"
            })
        }
    } catch (e) {
        return e.message;
    }
}

async function addShareContent(client, contentID, ownerID, shareUserID, viewAccess, accessType, expiryTime) {
    try {
        let contentDetails = await getSpecificContent(client, contentID)
        if (contentDetails.rowCount === 0) {
            return ({
                "msg": "content details not found"
            })
        } else {
            if (contentDetails.rows[0].user_id === ownerID) {

                let ownerWalletDetail = await walletModel.getWalletDetail(client, ownerID);
                let shareUserWalletDetail = await walletModel.getWalletDetail(client, shareUserID);

                let ownerPrivateKey = await ServerCrypto.serverDecryption(ownerWalletDetail.rows[0].private_key);

                let shareUserPublicKey = await ServerCrypto.serverDecryption(shareUserWalletDetail.rows[0].public_key);

                let decryptedContentHash = await EthCrypto.privateKeyDecryption(contentDetails.rows[0].file_encrypted_hash, ownerPrivateKey);

                let encryptedContentHashWithShareUserKey = await EthCrypto.publicKeyEncryption(decryptedContentHash, shareUserPublicKey);
                let contentType = contentDetails.rows[0].file_type;

                let onchainReceipt = await onchainContent.shareContentOnchain(client, encryptedContentHashWithShareUserKey, contentID - 1, contentType, ownerID, shareUserID, viewAccess, accessType, expiryTime);

                if (onchainReceipt.status != true) {
                    return ({
                        "msg": "OnChain Transaction failed",
                        "error": onchainReceipt
                    })
                }

                let newShareContentID = await DB.insertIntoQueryWithClient(client, DB.tables.sharedContent, {
                    file_encrypted_hash: encryptedContentHashWithShareUserKey,
                    file_name: contentDetails.rows[0].file_name,
                    file_type: contentDetails.rows[0].file_type,
                    thumbnail_file_path: contentDetails.rows[0].thumbnail_file_path,
                    access_type: accessType,
                    view_access: viewAccess,
                    expiry_time: expiryTime,
                    category_id: contentDetails.rows[0].category_id,
                    owner_id: ownerID,
                    receiver_id: shareUserID,
                    content_id: contentID
                }, ['id']);

                return ({
                    "newShareContentID": newShareContentID.rows[0].id,
                    "onchainReceipt": onchainReceipt.status
                })

            } else {
                return false;
            }
        }
    } catch (e) {
        return e.message;
    }
}

async function getSpecificUserContent(client, id) {
    try {
        let response = await client.query(`SELECT * from ${DB.tables.content} where user_id = ${id}`);
        return response
    } catch (e) {
        return e.message;
    }
}

async function getSpecificContent(client, contentID) {
    try {
        let response = await client.query(`SELECT * from ${DB.tables.content} where id = ${contentID}`);
        return response
    } catch (e) {
        return e.message;
    }

}

async function getAllUserContent(client) {
    try {
        let response = await client.query(`SELECT * from ${DB.tables.content}`);
        return response.rows
    } catch (e) {
        return e.message;
    }
}

module.exports = {
    getAllUserContent: getAllUserContent,
    addContent: addContent,
    getSpecificContent: getSpecificContent,
    getSpecificUserContent: getSpecificUserContent,
    addShareContent: addShareContent
};