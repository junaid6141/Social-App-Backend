const config = require('../config');
var CryptoJS = require("crypto-js");
const EthCrypto = require('eth-crypto');


// publicKeyEncryption - Function will be used to encrypted IPFS Hash with owner public Key

async function publicKeyEncryption(unencryptedHash, publicKey) {
    try {
        let encryptedHashObject = await EthCrypto.encryptWithPublicKey(
            publicKey, unencryptedHash
        );
        let encryptedHash = EthCrypto.cipher.stringify(encryptedHashObject);
        return encryptedHash;
    } catch (e) {
        return e.message;
    }
}

// privateKeyDecryption - Function will be used to decrypt IPFS Hash with owner private Key

async function privateKeyDecryption(encryptedHash, privateKey) {
    try {
        const encryptedHashObject = EthCrypto.cipher.parse(encryptedHash);
        let decryptedHash = await EthCrypto.decryptWithPrivateKey(
            privateKey, encryptedHashObject
        );
        return decryptedHash;

    } catch (e) {
        return e.message;
    }
}

module.exports = {
    publicKeyEncryption: publicKeyEncryption,
    privateKeyDecryption: privateKeyDecryption
}

