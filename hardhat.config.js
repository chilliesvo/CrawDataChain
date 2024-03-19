// Loading env configs for deploying and public contract source
require("dotenv").config();


// Using hardhat-ethers plugin for deploying
// See here: https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html
//           https://hardhat.org/guides/deploying.html
require("@nomiclabs/hardhat-ethers");

// Testing plugins with Waffle
// See here: https://hardhat.org/guides/waffle-testing.html
require("@nomiclabs/hardhat-waffle");

// This plugin runs solhint on the project's sources and prints the report
// See here: https://hardhat.org/plugins/nomiclabs-hardhat-solhint.html
require("@nomiclabs/hardhat-solhint");

// Verify and public source code on etherscan
require("@nomiclabs/hardhat-etherscan");

require("@openzeppelin/hardhat-upgrades");

require("hardhat-contract-sizer");

if (process.env.REPORT_GAS) {
    require("hardhat-gas-reporter");
}

if (process.env.EXPOSED) {
    // Expose internal functions for smart contract testing
    require("hardhat-exposed");
}

if (process.env.REPORT_COVERAGE) {
    require("solidity-coverage");
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
        binance_testnet: {
            url: process.env.BINANCE_TESTNET_RPC,
            accounts: [process.env.SYSTEM_PRIVATE_KEY],
        },
        mumbai: {
            url: process.env.MUMBAI_RPC,
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
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: false,
        strict: true,
    },
    mocha: {
        timeout: 200000,
        useColors: true,
        reporter: "mocha-multi-reporters",
        reporterOptions: {
            configFile: "./mocha-report.json",
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
        currency: "USD",
        token: "ETH",
        noColors: true, //optional
        gasPrice: 10, //gwei
        outputFile: process.env.EXPORT_GAS ? "gas-report.txt" : "", //optional
        coinmarketcap: process.env.COIN_MARKET_API,
    },
    exposed: {
        prefix: "$",
    }
};

module.exports = config;
