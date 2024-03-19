const { ethers, upgrades } = require("hardhat");

async function main() {
    //* Loading contract factory */
    const NFTFactory = await ethers.getContractFactory("NFTFactory");

    //* Deploy contracts */
    console.log("================================================================================");
    console.log("UPDATING CONTRACTS");
    console.log("================================================================================");

    const admin = await upgrades.erc1967.getAdminAddress("address proxy");
    await upgrades.upgradeProxy("address proxy", NFTFactory);
    console.log("NFTFactory upgraded");

    console.log("================================================================================");
    console.log("DONE");
    console.log("================================================================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
