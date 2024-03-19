const { ethers, upgrades } = require("hardhat");
const clc = require("cli-color");
const fs = require("fs");
require("dotenv").config();

/**
 * @dev Load contract factories for specified contracts using provided ethers instance.
 * @returns The contract factories.
 */
const contractFactoriesLoader = async () => {
    const contractNames = fs
        .readdirSync(`./contracts/`)
        .map((contractFileName) => {
            return contractFileName === "libraries" || contractFileName === "utils"
                ? fs.readdirSync(`./contracts/${contractFileName}/`)
                : contractFileName;
        })
        .flat()
        .filter((contractFileName) => contractFileName.indexOf(".sol") > -1)
        .map((contractName) => contractName.replace(".sol", ""));

    const contractsFactories = {};
    await Promise.all(
        contractNames.map(async (contractName) => {
            const contractFactory = await ethers.getContractFactory(contractName);
            contractFactory.contractName = contractName;
            contractsFactories[contractName] = contractFactory;
        })
    );
    return contractsFactories;
};

const deploy = async (contractFactory, params) => {
    params = !params ? [] : params;
    const contract = await contractFactory.deploy(...params);
    await contract.deployed();

    const gasUsed = Number((await contract.deployTransaction.wait()).gasUsed);
    contract.gasUsed = gasUsed;

    return contract;
};

const deployProxy = async (contractFactory, params) => {
    params = !params ? [] : params;
    const contract = await upgrades.deployProxy(contractFactory, params);
    await contract.deployed();

    const gasUsed = Number((await contract.deployTransaction.wait()).gasUsed);
    const addressVerify = await upgrades.erc1967.getImplementationAddress(contract.address);

    contract.gasUsed = gasUsed;
    contract.addressVerify = addressVerify;

    return contract;
};

/**
 * @dev Deploys the contract with the provided bytecode and arguments, logs the contract address and to the terminal
 * @return The deployed contract instance.
 */
const deployAndLogger = async (contractFactory, params) => {
    const contractInstance = await deploy(contractFactory, params);
    console.log(_convertMessage(contractFactory.contractName, "contract deployed to"), contractInstance.address);
    return contractInstance;
};

/**
 * @dev Deploys the contract proxy with the provided bytecode and arguments, logs the contract address and to the terminal
 * @return The deployed contract instance.
 */
const deployProxyAndLogger = async (contractFactory, params) => {
    const contractInstance = await deployProxy(contractFactory, params);
    console.log(_convertMessage(contractFactory.contractName, "contract deployed Proxy to"), contractInstance.address);
    console.log(_convertMessage(contractFactory.contractName, "contract verify from"), contractInstance.addressVerify);

    return contractInstance;
};

/**
 * @dev The function should return the information of a contract that was deployed at a specific time in the past.
 * @return contract deployed info
 */
const getDeployedInfo = async (timestamp) => {
    //* Get network */
    const network = await ethers.provider.getNetwork();
    const networkName = network.chainId === 31337 ? "hardhat" : network.name;

    //** Get information about deployed contracts */
    const deployHistoryFileName = `${network.chainId}-${networkName}`;
    const deployHistoryList = fs.readdirSync(`./deploy-history/${deployHistoryFileName}/`);

    const requestInfo =
        timestamp === "latest"
            ? deployHistoryList.pop()
            : deployHistoryList.find((history) => history === `${timestamp}.json`);
    return require(`../deploy-history/${deployHistoryFileName}/${requestInfo}`);
};

const _convertMessage = (contractName, message) => {
    const maxStringLengthToMessage = 45;
    const messageLength = contractName.length + message.length;
    const repeatCount = Math.abs(maxStringLengthToMessage - messageLength);
    const spaces = " ".repeat(repeatCount);
    return clc.green(contractName) + " " + message + spaces + " :>>";
};

module.exports = {
    contractFactoriesLoader,
    deploy,
    deployProxy,
    deployAndLogger,
    deployProxyAndLogger,
    getDeployedInfo,
    getCrossmintAddress,
    getForwarderAddresses,
    getNativeTokenWrapperAddress,
};
