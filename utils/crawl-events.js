const { ethers } = require("hardhat");
const { utils } = ethers;
require("dotenv").config();
const env = process.env;
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { blockTimestamp } = require("../test/utils");

const ABI = JSON.stringify(require("./abi.json"));
const RPC_PROVIDER = env.POLYGON_RPC;

const crawlEvents = async (contractAddress, fromBlock, toBlock) => {
    //* Get network */
    const network = await ethers.provider.getNetwork();
    const networkName = network.chainId === 31337 ? "hardhat" : network.name;
    const blockTimeNow = await blockTimestamp();

    const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);
    const factoryContract = new ethers.Contract(contractAddress, ABI, rpcProvider);

    try {
        const maxBlockToCrawl = 40000;
        const loop = (toBlock - fromBlock) / maxBlockToCrawl + 1;

        const summaryEvent = [];
        console.log("loop", loop);
        for (let i = 0; i <= loop; ++i) {
            const toBlock = fromBlock + maxBlockToCrawl;
            console.log(i);
            // Fetch events data
            const events = await factoryContract.queryFilter(
                {
                    address: contractAddress,
                    topics: [
                        // the name of the event, parnetheses containing the data type of each event, no spaces
                        utils.id("SetAdmin(address,bool)"),
                    ],
                },
                fromBlock,
                toBlock
            );

            fromBlock = toBlock;

            // Retrieve all event informations
            if (!events || events.length === 0) continue;
            for (let i = 0; i < events.length; i++) {
                const event = events[i];

                if (!event) continue;
                if (Object.keys(event).length === 0) continue;

                const user = { transactionHash: event.transactionHash };
                user["account"] = event.args?.account;
                user["allow"] = event.args?.allow.toString();

                summaryEvent.push(user);
            }
        }
        console.log("summaryEvent :>> ", summaryEvent);

        const dir = `./csv-export/${network.chainId}-${networkName}/`;
        const fileName = network.chainId === 31337 ? "hardhat" : blockTimeNow;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const path = `${dir}/${fileName}.csv`;
        const csvWriter = createCsvWriter({
            path: path,
            header: [
                { id: "transactionHash", title: "TransactionHash" },
                { id: "account", title: "Account" },
                { id: "allow", title: "Allow" },
            ],
        });

        await csvWriter.writeRecords(summaryEvent);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    crawlEvents,
};
