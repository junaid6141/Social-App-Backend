const Web3 = require("web3");
const DB = require("../model/db")
const config = require("../config");
const EventDatastorage = require('../model/Contracts')

const web3 = new Web3(new Web3.providers.HttpProvider(config.erc875.web3Endpoint));
const _contract = new web3.eth.Contract(config.erc875.contractABI, config.erc875.contractAddress)

const addEventsOffChain = async () => {
    try {
        console.log(`Contract watcher for address ${config.erc875.contractAddress} is searching for new events.`);
        try {
            let getLatestRecord = await EventDatastorage.getLatestBlock(DB.pool);
            console.log("latest block", getLatestRecord);
            updateerc875Records(getLatestRecord);
        } catch (e) {
            console.warn("Warning! Service not feeding database. ", e);
        }
    } catch (e) {
        console.warn("Warning! Service not feeding database. ", e);
    }
    setTimeout(() => {
        addEventsOffChain();
    }, 10000);
};

const updateerc875Records = async data => {
    console.log("in function", data)
    _contract.getPastEvents({}, {
            fromBlock: data !== null ?
                typeof data === "undefined" ?
                0 :
                data + 1 : 0,
            toBlock: "latest"
        },
        async (error, event) => {
            if (error) return;
            if (Array.isArray(event)) {
                console.log(event.length)
                if (event.length === 0) return;
                try {
                    event.forEach(async eventDetail => {

                        let txDetailsReceipt = await web3.eth.getTransactionReceipt(
                            eventDetail.transactionHash
                        );
                        let txDetails = await web3.eth.getTransaction(
                            eventDetail.transactionHash
                        );
                        let response = await EventDatastorage.addERC875EventsToOffChain(DB.pool, eventDetail.address, eventDetail.blockHash, eventDetail.blockNumber, eventDetail.transactionHash, eventDetail.transactionIndex, eventDetail.returnValues, txDetailsReceipt.from, txDetailsReceipt.to, txDetailsReceipt.status, txDetails.nonce, eventDetail.event);
                    });
                } catch (e) {
                    if (e) console.warn("Error! Records not fetching. ", e);
                }
            }
        }
    );
};

addEventsOffChain();