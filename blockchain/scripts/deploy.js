require("dotenv/config");
require("@nomicfoundation/hardhat-ethers");
const hre = require("hardhat");

async function main() {//Grab the first signer from the configured accounts.
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying with:", deployer.address);
	const JobBoard =await hre.ethers.getContractFactory("JobBoard");//Fetch the contract factory
	const jobBoard= await JobBoard.deploy();//Deploy the contract. 
	await jobBoard.waitForDeployment();
	console.log("JobBoard deployed at:", await jobBoard.getAddress());
}
main().catch((error) => {//error handler
	console.error(error);
	process.exitCode = 1;
});
