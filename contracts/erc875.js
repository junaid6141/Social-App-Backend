const ServerCrypto = require('../helper/crypto');
const config = require('../config');
const walletModel = require('../model/Wallet');
const EthereumTx = require('ethereumjs-tx').Transaction
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(config.erc875.web3Endpoint));

// addContentOnchain - Function is used to add new content onChain

async function addContentOnchain(client, encryptedHash, contentType, userID) {
    try {
        let walletDetail = await walletModel.getWalletDetail(client, userID);
        let userAddress = walletDetail.rows[0].address;
        let userPrivateKey = await ServerCrypto.serverDecryption(walletDetail.rows[0].private_key);

        const _contract = new web3.eth.Contract(config.erc875.contractABI, config.erc875.contractAddress)
        const data = await _contract.methods.addNewContent(encryptedHash, contentType).encodeABI();
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        const count = await web3.eth.getTransactionCount(userAddress)
        const rawTransaction = {
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: config.erc875.contractAddress,
            data: data,
            from: userAddress,
            _chainId: config.erc875.chainID
        };

        userPrivateKey = userPrivateKey.replace(/0x/, "");
        const privateKey = new Buffer.from(userPrivateKey, "hex");
        const tx = new EthereumTx(rawTransaction, config.erc875.TX_CONFIG);
        tx.sign(privateKey);

        const serializedTx = tx.serialize().toString("hex");

        const receipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
        return receipt;

    } catch (e) {
        return e.message;
    }
}


// shareContentOnchain - Function is used to add copy of content onChain

async function shareContentOnchain(client, encryptedHashWithShareUserKey, contentID, contentType, ownerID, shareUserID, viewAccess, accessType, expiryTime) {
    try {
        let ownerWalletDetail = await walletModel.getWalletDetail(client, ownerID);
        let ownerAddress = ownerWalletDetail.rows[0].address;
        let ownerPrivateKey = await ServerCrypto.serverDecryption(ownerWalletDetail.rows[0].private_key);

        let shareUserWalletDetail = await walletModel.getWalletDetail(client, shareUserID);
        let shareUserAddress = shareUserWalletDetail.rows[0].address;

        const _contract = new web3.eth.Contract(config.erc875.contractABI, config.erc875.contractAddress)
        const data = await _contract.methods.issueContentCopy(contentID, encryptedHashWithShareUserKey, shareUserAddress, contentType, accessType, viewAccess, new Date(expiryTime).getTime()).encodeABI();
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        const count = await web3.eth.getTransactionCount(ownerAddress)
        const rawTransaction = {
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: config.erc875.contractAddress,
            data: data,
            from: ownerAddress,
            _chainId: config.erc875.chainID
        };

        ownerPrivateKey = ownerPrivateKey.replace(/0x/, "");
        const privateKey = new Buffer.from(ownerPrivateKey, "hex");
        const tx = new EthereumTx(rawTransaction, config.erc875.TX_CONFIG);
        tx.sign(privateKey);

        const serializedTx = tx.serialize().toString("hex");

        const receipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
        return receipt;

    } catch (e) {
        return e.message;
    }
}



module.exports = {
    addContentOnchain: addContentOnchain,
    shareContentOnchain: shareContentOnchain
}