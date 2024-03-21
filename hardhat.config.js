// Loading env configs for deploying and public contract source
require("dotenv").config();

// Using hardhat-ethers plugin for deploying
// See here: https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html
//           https://hardhat.org/guides/deploying.html
require("@nomiclabs/hardhat-ethers");

// Testing plugins with Waffle
// See here: https://hardhat.org/guides/waffle-testing.html
require("@nomiclabs/hardhat-waffle");

// Verify and public source code on etherscan
require("@nomiclabs/hardhat-etherscan");

require("@openzeppelin/hardhat-upgrades");

if (process.env.REPORT_GAS) {
    require("hardhat-gas-reporter");
}

// This plugin adds ways to ignore Solidity warnings
require("hardhat-ignore-warnings");

const config = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            accounts: { count: 100 },
            allowUnlimitedContractSize: false,
            blockGasLimit: 500e9,
        },
        // Testnet chains
        goerli: {
            url: process.env.GOERLI_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        tbsc: {
            url: process.env.BINANCE_TESTNET_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        mumbai: {
            url: process.env.MUMBAI_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        cvc: {
            url: process.env.CVC_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        tcvc: {
            url: process.env.CVC_TESTNET_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        frame: {
            url: 'http://127.0.0.1:1248', // To run inside WSL2, see IP in file /etc/resolv.conf
            timeout: 4000000
        }
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHER_API_KEY,
            bsc: process.env.BINANCE_API_KEY,
            polygon: process.env.POLYGON_API_KEY,
            goerli: process.env.ETHER_API_KEY,
            bscTestnet: process.env.BINANCE_API_KEY,
            polygonMumbai: process.env.POLYGON_API_KEY,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.8.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
        deploy: "deploy",
        deployments: "deployments",
    },
    mocha: {
        timeout: 200000,
        useColors: true,
        reporter: "mocha-multi-reporters",
        reporterOptions: {
            configFile: "./mocha-report.json",
        },
    },
    exposed: {
        prefix: "$",
    }
};

module.exports = config;
