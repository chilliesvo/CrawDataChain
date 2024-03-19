const { ethers } = require("hardhat");
const {
    deployProxyAndLogger,
    contractFactoriesLoader,
} = require("../utils/deploy.utils");
const { blockTimestamp } = require("../utils/utils");
require("dotenv").config();
const env = process.env;
const fs = require("fs");

async function main() {
    //* Get network */
    const network = await ethers.provider.getNetwork();
    const networkName = network.chainId === 31337 ? "hardhat" : network.name;
    const blockTimeNow = await blockTimestamp();

    //* Loading accounts */
    const accounts = await ethers.getSigners();
    const addresses = accounts.map((item) => item.address);
    const deployer = addresses[0];

    //* Loading contract factory */
    const contractFactories = await contractFactoriesLoader();

    //* Deploy contracts */
    const underline = "=".repeat(93);
    console.log(underline);
    console.log("DEPLOYING CONTRACTS");
    console.log(underline);
    console.log("chainId   :>> ", network.chainId);
    console.log("chainName :>> ", networkName);
    console.log("deployer  :>> ", deployer);
    console.log(underline);

    const verifyArguments = {
        chainId: network.chainId,
        networkName,
        deployer,
    };

    const constructorParams = [];
    const contractInstance = await deployProxyAndLogger(contractFactories.contract, constructorParams);
    verifyArguments.contractInstance = contractInstance.address;
    verifyArguments.contractInstanceVerify = contractInstance.addressVerify;

    console.log(underline);
    console.log("DONE");
    console.log(underline);

    const dir = `./deploy-history/${network.chainId}-${networkName}/`;
    const fileName = network.chainId === 31337 ? "hardhat" : blockTimeNow;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await fs.writeFileSync("contracts.json", JSON.stringify(verifyArguments));
    await fs.writeFileSync(`${dir}/${fileName}.json`, JSON.stringify(verifyArguments));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
