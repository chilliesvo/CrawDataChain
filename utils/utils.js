const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const Big = require("big.js");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { expect } = require("chai");
const keccak256 = require("keccak256");
const { BigNumber } = ethers;
const clc = require("cli-color");

const blockTimestamp = async () => {
    return (await ethers.provider.getBlock()).timestamp;
};

const weiToEther = (weiValue) => {
    return ethers.utils.formatEther(weiValue);
};

const skipTime = async (seconds) => {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
};

const setTime = async (time) => {
    await network.provider.send("evm_setNextBlockTimestamp", [time]);
    await network.provider.send("evm_mine");
};

function convertToTimestamp(dd, mm, yy, h, m, s) {
    const date = new Date(`${mm}/${dd}/${yy} ${h}:${m}:${s}`);
    return Math.floor(date.getTime() / 1000);
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // Adjust the time unit to match the unit used in the timestamp
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
}

const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const getProfit = (pool, days, deposedCash, round) => {
    return Big((pool + 2) ** (1 / 365))
        .pow(days)
        .minus(1)
        .times(deposedCash)
        .round(round ? round : 18)
        .toString();
};

const getProfitRoot = (pool, days, deposedCash, round) => {
    return Big((pool + 2) ** (1 / 365))
        .pow(days)
        .times(deposedCash)
        .round(round ? round : 18)
        .toString();
};

const skipBlock = async (blockNumber) => {
    for (let index = 0; index < blockNumber; index++) {
        await hre.ethers.provider.send("evm_mine");
    }
};

const getCurrentBlock = async () => {
    const latestBlock = await hre.ethers.provider.getBlock("latest");
    return latestBlock.number;
};

const getBalance = async (address) => {
    return ethers.provider.getBalance(address);
};

const getEstimateGas = async (transactionData) => {
    return ethers.provider.estimateGas({ data: transactionData });
};

const getCostGasDeployed = async (transactionData) => {
    const gasUsed = await ethers.provider.estimateGas({
        data: transactionData.deployTransaction.data,
    });
    const gasPrice = transactionData.deployTransaction.gasPrice;
    return gasUsed.mul(gasPrice);
};

const formatEther = (weiValue) => {
    return ethers.utils.formatEther(weiValue);
};

const parseEther = (number) => {
    number = isNaN(number) ? number : number.toString();
    return ethers.utils.parseEther(number);
};

const sendNativeCoinFrom = async (fromSigner, toAddress, value) => {
    await fromSigner.sendTransaction({
        to: toAddress,
        value: parseEther(value),
    });
};

const burnNativeCoinFrom = async (fromSigner, value) => {
    await fromSigner.sendTransaction({
        to: ZERO_ADDRESS,
        value: parseEther(value),
    });
};

const parseEthers = (numbers) => {
    return numbers.map((number) => ethers.utils.parseEther(number.toString()));
};

const generateMerkleTree = (whiteList) => {
    const leafNodes = whiteList.map((addr) => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
};

const hexProof = (merkleTree, walletAddress) => {
    return merkleTree.getHexProof(keccak256(walletAddress));
};

const hexProofs = (merkleTree, walletAddresses) => {
    return walletAddresses.map((address) => merkleTree.getHexProof(keccak256(address)));
};

const checkIsOwnerOfTokenIds = async (token, tokenIds, accounts) => {
    if (tokenIds.length !== accounts.length) throw "checkIsOwnerOfTokenIds: tokenIds and accounts length mismatch";
    for (let i = 0; i < tokenIds.length; i++) {
        expect(await token.ownerOf(tokenIds[i])).to.equal(accounts[i]);
    }
};

const checkIsNotOwnerOfTokenIds = async (token, tokenIds, accounts) => {
    if (tokenIds.length !== accounts.length) throw "checkIsOwnerOfTokenIds: tokenIds and accounts length mismatch";
    for (let i = 0; i < tokenIds.length; i++) {
        expect(await token.ownerOf(tokenIds[i])).to.not.equal(accounts[i]);
    }
};

const checkBalanceOfTokenIds = async (token, accounts, tokenIds, balances) => {
    if (tokenIds.length !== accounts.length) throw "checkBalanceOfTokenIds: tokenIds and accounts length mismatch";
    if (tokenIds.length !== balances.length) throw "checkBalanceOfTokenIds: tokenIds and balances length mismatch";
    for (let i = 0; i < tokenIds.length; i++) {
        expect(await token.balanceOf(accounts[i], tokenIds[i])).to.equal(balances[i]);
    }
};

const checkNotHaveBalanceOfTokenIds = async (token, accounts, tokenIds) => {
    if (tokenIds.length !== accounts.length) throw "checkBalanceOfTokenIds: tokenIds and accounts length mismatch";
    for (let i = 0; i < tokenIds.length; i++) {
        expect(await token.balanceOf(accounts[i], tokenIds[i])).to.equal(0);
    }
};

const checkTokenURIs = async (token, tokenIds, uris) => {
    if (tokenIds.length !== uris.length) throw "checkTokenURIs: tokenIds and uris length mismatch";
    await Promise.all(
        tokenIds.map(async (tokenId, index) => expect(await token.tokenURI(tokenId)).to.equal(uris[index]))
    );
};

const genNumbersASC = (_from, _to) => {
    if (_from < 0) throw "genNumbersASC: _startTo must be equal 0 or bigger 0";
    if (_to <= _from) throw "genNumbersASC: _from must be bigger _startTo";
    return Array(_to - _from + 1)
        .fill()
        .map((_, index) => index + _from);
};

const genTokenUrisWithIdASC = (amount) => {
    return Array(amount)
        .fill()
        .map((_, index) => `ipfs://{CID}/${index + 1}.json`);
};

function bigNumbersToNumbers(bigNumbers) {
    return bigNumbers.map(Number);
}

function numberToBigNumber(numberString) {
    return BigNumber.from(numberString);
}

function numbersToBigNumbers(stringNumbers) {
    return stringNumbers.map(number => numberToBigNumber(number));
}

function signersToAddresses(signers) {
    return signers.map((signer) => signer.address);
}

function expectStruct(expected, equal, isLog) {
    const expectedKeys = Object.keys(expected).filter((key) => isNaN(Number(key)));
    const equalKeys = Object.keys(equal).filter((key) => key);
    if (expectedKeys.length !== equalKeys.length) "expectStruct: expected and equal length mismatch";

    expectedKeys.map((expectedKey, index) => {
        isLog === undefined ? false : isLog;
        const equalKey = equalKeys[index];
        if (expectedKey !== equalKey) {
            throw `<${expectedKey}> cannot be mapped to <${equalKey}>`;
        } else {
            if (isLog) {
                const equalValue =
                    expected[expectedKey].toString() !== equal[expectedKey].toString()
                        ? clc.red(equal[expectedKey])
                        : clc.yellow(equal[expectedKey]);
                console.log(
                    `${clc.green(expectedKey)}: ${clc.yellow(expected[expectedKey])} ->`,
                    `${equalKey}: ${equalValue}`
                );
            }
            expect(expected[expectedKey]).to.equal(equal[expectedKey]);
        }
    });
    if (isLog) console.log("\n");
}

async function getEvent(tx, eventName) {
    const rc = await tx.wait();
    const eventArgs = rc.events.find((event) => event.event === eventName).args;
    const eventObject = {};
    Object.keys(eventArgs)
        .filter((key) => isNaN(Number(key)))
        .map((eventArg) => {
            eventObject[eventArg] = eventArgs[eventArg];
        });
    return eventObject;
}

module.exports = {
    ZERO_ADDRESS,
    blockTimestamp,
    skipTime,
    setTime,
    getProfit,
    getProfitRoot,
    skipBlock,
    getCurrentBlock,
    weiToEther,
    parseEther,
    parseEthers,
    generateMerkleTree,
    hexProof,
    hexProofs,
    checkIsOwnerOfTokenIds,
    checkIsNotOwnerOfTokenIds,
    checkBalanceOfTokenIds,
    checkNotHaveBalanceOfTokenIds,
    checkTokenURIs,
    genNumbersASC,
    formatEther,
    getBalance,
    sendNativeCoinFrom,
    burnNativeCoinFrom,
    getEstimateGas,
    getCostGasDeployed,
    sleep,
    convertToTimestamp,
    bigNumbersToNumbers,
    numberToBigNumber,
    numbersToBigNumbers,
    signersToAddresses,
    genTokenUrisWithIdASC,
    formatTimestamp,
    expectStruct,
    getEvent,
};
