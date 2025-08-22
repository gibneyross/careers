require("dotenv/config");
require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.20",//compiler version
		settings:{optimizer:{ enabled: true, runs: 200 } },//enable optimizer for smaller gas usage
	},
	networks: {
		localhost: {
			url: "http://127.0.0.1:8545",//local Hardhat node
		},
		sepolia: {//.env details
			url: process.env.SEPOLIA_RPC_URL || "",
			accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
			chainId: 11155111,//sepolia chain ID
		},
	},
};
