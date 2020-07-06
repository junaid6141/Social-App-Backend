const ipfsAPI = require('ipfs-api');
const config = require('../config');

const ipfs = ipfsAPI(config.ipfs.url, config.ipfs.port, { protocol: config.ipfs.protocol })

// uploadEncryptedFile - Function used to upload encrypted file to IPFS

async function uploadEncryptedFile(encryptedFile) {
    try {
        let decryptedHash = await ipfs.files.add(encryptedFile);
        return decryptedHash;

    } catch (e) {
        return e.message;
    }
}

// getEncryptedFile - Function used to get encrypted file from IPFS

async function getEncryptedFile(encryptedFileHash) {
    try {
        let response = await ipfs.files.get(encryptedFileHash);
        return response;

    } catch (e) {
        return e.message;
    }
}

module.exports = {
    uploadEncryptedFile: uploadEncryptedFile,
    getEncryptedFile: getEncryptedFile
}

