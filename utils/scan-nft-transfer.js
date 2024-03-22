const { ethers } = require("hardhat");
const { utils } = ethers;
require("dotenv").config();
const env = process.env;
const fs = require("fs");

// const rpcProvider = new ethers.providers.JsonRpcProvider(env.CVC_TESTNET_RPC);
// const NFTChecker_ADDRESS = "0x22978e83A94a101E9A37ff0f2Fc9dC54AA5e6E54"; //CVC_TESTNET
const NFTChecker_ADDRESS = "0x03e6b92233F58d6087340126d5F6253B617BABC3"; //MUMBAI_TESTNET
const rpcProvider = new ethers.providers.JsonRpcProvider(env.MUMBAI_RPC);

const scanNftTransfer = async (fromBlock, toBlock, maxBlockToCrawl) => {
    //* Get network */
    const network = await ethers.provider.getNetwork();
    const networkName = network.chainId === 31337 ? "hardhat" : network.name;
    const currentTime = await Date.now();

    const NFTChecker = await ethers.getContractFactory("NFTChecker");
    const nftChecker = await NFTChecker.attach(NFTChecker_ADDRESS);

    const result = [];
    try {
        // Calculate times number to call
        const times = (toBlock - fromBlock) / maxBlockToCrawl + 1;

        for (let i = 0; i <= times; ++i) {
            toBlock = fromBlock + maxBlockToCrawl;
            // Get block history
            const blockHistory = await rpcProvider.getLogs({ fromBlock: fromBlock, toBlock: toBlock });

            fromBlock = toBlock;

            if (blockHistory.length) {
                const transferTransactions = await getTransferTransactions(blockHistory, nftChecker);

                if (transferTransactions.length) {
                    console.log(`push :>> ${transferTransactions.length} records`);
                    const ownerHistory = await getOwnerHistory(transferTransactions, nftChecker);
                    result.push(ownerHistory);
                }
            }
        }

        if (result.length) {
            const dir = `./scan-export/${network.chainId}-${networkName}/`;
            const fileName = network.chainId === 31337 ? "hardhat" : currentTime;
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            await fs.writeFileSync(`${dir}/${fileName}.json`, JSON.stringify(result));
        }
    } catch (error) {
        console.log(error);
    }
};

const getTransferTransactions = async (blockHistory, nftChecker) => {
    // Get event signature
    const transferSignature = "Transfer(address,address,uint256)";
    const transferSingleSignature = "TransferSingle(address,address,address,uint256,uint256)";

    // Get the data hex string
    const eventTopics = [transferSignature, transferSingleSignature].map(signature => utils.id(signature));

    // Skip duplicate address
    const filteredDuplicateAddress = Array.from(new Map(blockHistory.map(tx => [tx.address, tx])).values());
    // Get NFT addresses
    const nftAddresses = (await Promise.all(filteredDuplicateAddress.map(async tx => {
        const isNFT = await nftChecker.isNFT(tx.address);
        if (isNFT) return tx.address;
    }))).filter(result => result !== undefined);

    if (nftAddresses.length) {
        const nftTransactions = blockHistory.filter(tx => nftAddresses.includes(tx.address));
        const transferTransactions = nftTransactions.filter(tx => eventTopics.includes(tx.topics[0].toLowerCase()));
        return transferTransactions;
    }
    return [];
}

const getOwnerHistory = async (transferTransactions, nftChecker) => {
    const NFTInstance = await ethers.getContractFactory("ERC721");
    const ownerHistory = await Promise.all(transferTransactions.map(async tx => {
        const tokenAddress = tx.address;
        const nftInstance = await NFTInstance.attach(tokenAddress);
        const tokenName = await nftInstance.name();
        const tokenSymbol = await nftInstance.symbol();
        const isERC721 = await nftChecker.isERC721(tokenAddress);

        if (isERC721) {
            const [eventSignature, from, to, tokenId] = tx.topics;
            return {
                blockNumber: tx.blockNumber,
                tokenType: "ERC-721",
                contractAddress: tokenAddress,
                name: tokenName,
                symbol: tokenSymbol,
                eventSignature: eventSignature,
                from: addressDecode(from),
                to: addressDecode(to),
                tokenId: uint256Decode(tokenId),
                transactionHash: tx.transactionHash,
                logIndex: tx.logIndex,
                txLog: tx
            };
        } else {
            const [eventSignature, operator, from, to] = tx.topics;
            const [tokenId, TokenAmount] = apiDecode(['uint256', 'uint256'], tx.data);
            return {
                blockNumber: tx.blockNumber,
                tokenType: "ERC-1155",
                contractAddress: tokenAddress,
                name: tokenName,
                symbol: tokenSymbol,
                eventSignature: eventSignature,
                operator: addressDecode(operator),
                from: addressDecode(from),
                to: addressDecode(to),
                tokenId: Number(tokenId),
                TokenAmount: Number(TokenAmount),
                transactionHash: tx.transactionHash,
                logIndex: tx.logIndex,
                txLog: tx
            };
        }
    }));

    return ownerHistory;
}

// Decode a data hashing to an array
const apiDecode = (types, data) => {
    const dataDecoded = ethers.utils.defaultAbiCoder.decode(types, data);
    return dataDecoded;
};

// Decode a hashing to a number
const uint256Decode = (data) => {
    const dataDecoded = ethers.utils.defaultAbiCoder.decode(['uint256'], data);
    return Number(dataDecoded);
}

// Decode a hashing to an address
const addressDecode = (data) => {
    const [address] = ethers.utils.defaultAbiCoder.decode(['address'], data);
    return address;
}

module.exports = {
    scanNftTransfer,
};
