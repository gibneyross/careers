import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3.jsx";
import abiJson from "../abi/JobBoard.json";
import deployed from "../abi/deployedAddress.json";
const ADDRS = {
  11155111: deployed.sepolia,//sepolia address
};
export default function useJobBoard() {
	const { provider, signer, chainId } = useWeb3();
	const [contract, setContract] = useState(null);
	useEffect(() => {
		const addr = ADDRS[Number(chainId)] || deployed.localhost;
		if (!addr || (!provider && !signer)) return;
		try {
			const c = new ethers.Contract(addr, abiJson.abi, signer || provider);
			setContract(c);
		} catch (e) { console.error(e); }
	  }, [provider, signer, chainId]);
	return contract;
}
