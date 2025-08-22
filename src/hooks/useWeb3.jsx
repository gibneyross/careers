import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ethers } from "ethers";

const Ctx = createContext(null);

export function Web3Provider({ children }) {
	const [provider, setProvider] =useState(null);
	const [signer, setSigner] = useState(null);
	const [address, setAddress]= useState(null);
	const [chainId, setChainId]=useState(null);
	const desired = Number(import.meta.env.VITE_PUBLIC_CHAIN_ID || 11155111);
	useEffect(() => {
		if (!window.ethereum) return;
		const p = new ethers.BrowserProvider(window.ethereum);
		setProvider(p);
		p.getNetwork().then(n =>setChainId(Number(n.chainId)));
		window.ethereum.on?.("accountsChanged", acc => setAddress(acc?.[0] || null));//listen accounts
		window.ethereum.on?.("chainChanged", cid => setChainId(Number(cid)));//listen chain
	}, []);
	const connect = async () => {
		if (!window.ethereum) return alert("Install MetaMask");
		const p = new ethers.BrowserProvider(window.ethereum);
		await p.send("eth_requestAccounts", []);//request accounts
		const s = await p.getSigner();
		setProvider(p); setSigner(s);
		setAddress(await s.getAddress());
		const n = await p.getNetwork(); setChainId(Number(n.chainId));//set chain
	};

	const disconnect=() => { setSigner(null); setAddress(null); };
	const value = useMemo(() => ({
		provider, signer, address, chainId,
		connect, disconnect,
		networkOk: chainId === desired//check network
	  }), [provider, signer, address, chainId, desired]);
  	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useWeb3 = () => useContext(Ctx);//hook
