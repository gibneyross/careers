import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Applications from "./pages/Applications";
import jobBoardArtifact from "./abi/JobBoard.json";
import deployed from "./abi/deployedAddress.json";
import "./index.css";

const desired = Number(import.meta.env.VITE_PUBLIC_CHAIN_ID || 11155111);
const ADDRESS_BY_CHAIN = {
	11155111: deployed.sepolia,
};

async function ensureSepolia() {
	const ethereum = window.ethereum;
	  if (!ethereum?.request) return;
	try {
		await ethereum.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
		});
		} catch (switchError) {
			if (switchError?.code === 4902) {
				await ethereum.request({
					method: "wallet_addEthereumChain",
					params: [
				{
				chainId: "0xaa36a7",
				chainName: "Sepolia",
				rpcUrls: ["https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>"],
				nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
				blockExplorerUrls: ["https://sepolia.etherscan.io"],
			},
		],
	});
	} else if (switchError?.code === 4001) {
		throw new Error("User rejected network switch to Sepolia.");
	} else {
		throw switchError;
	}
	}
}

export default function App() {
	const [provider, setProvider] = useState(null);
	const [signer, setSigner]     = useState(null);
	const [account, setAccount]   = useState("");
	const [chainId, setChainId]   = useState(null);
	const [jobBoard, setJobBoard] = useState(null);
	const resolveAddress = useCallback((cid) => {
		const n = Number(cid);
		return ADDRESS_BY_CHAIN[n] ?? null;
	}, []);
 	 const initFromProvider = useCallback(async (p) => {
	const net = await p.getNetwork();
	if (Number(net.chainId) !== desired) {
		await ensureSepolia();
	}

	const net2 = await p.getNetwork();
	if (Number(net2.chainId) !== desired) {
		console.error("Not on the desired network. Please switch to Sepolia.");
		return;
	}

	const s =await p.getSigner();
	const a = await s.getAddress();
	const resolved = resolveAddress(net2.chainId);
	if (!resolved) {
		console.error("No Sepolia deployment found in deployedAddress.json");
		return;
	}
	const contract =new ethers.Contract(resolved, jobBoardArtifact.abi, s);
	setProvider(p);
	setSigner(s);
	setAccount(a);
	setChainId(Number(net2.chainId));
	setJobBoard(contract);
	console.log("Connected wallet:", a);
	console.log("Chain:", Number(net2.chainId), "Using JobBoard at:", resolved);
	}, [resolveAddress]);

	// Connect button handler
	const connectWallet = useCallback(async () => {
	if (!window.ethereum) {
		alert("MetaMask not detected");
		return;
	}
	await window.ethereum.request({ method: "eth_requestAccounts" });
	const p = new ethers.BrowserProvider(window.ethereum);
	await initFromProvider(p);
	}, [initFromProvider]);

	// Auto-connect on load
	useEffect(() => {
		const auto = async () => {
			if (!window.ethereum) return;
			try {
				const accs = await window.ethereum.request({ method: "eth_accounts" });
					if (accs && accs.length > 0) {
						const p = new ethers.BrowserProvider(window.ethereum);
						await initFromProvider(p);
					}
				} catch (e) {
					console.warn("Auto-connect skipped:", e?.message);
				}
			};
			auto();
		}, [initFromProvider]);

	//React to account changes
	useEffect(() => {
	if (!window.ethereum) return;
	const onAccountsChanged = async (accs) => {
		const next = accs?.[0] || "";
		setAccount(next);
		if (!next) {
			// Disconnected: keep provider but drop signer/contract references
			setSigner(null);
			setJobBoard(null);
			return;
		}
		const p = new ethers.BrowserProvider(window.ethereum);
		const s = await p.getSigner();
		const net = await p.getNetwork();
		if (Number(net.chainId) !== desired) {
			try { await ensureSepolia(); } catch {}
		}
		const net2 = await p.getNetwork();
		const resolved = resolveAddress(net2.chainId);
		if (resolved) setJobBoard(new ethers.Contract(resolved, jobBoardArtifact.abi, s));
		setSigner(s);
		setChainId(Number(net2.chainId));
		};

		const onChainChanged = async () => {
		const p = new ethers.BrowserProvider(window.ethereum);
		await initFromProvider(p);
	};
	window.ethereum.on?.("accountsChanged", onAccountsChanged);
	window.ethereum.on?.("chainChanged", onChainChanged);
	return () => {
		window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
		window.ethereum.removeListener?.("chainChanged", onChainChanged);
	};
}, [initFromProvider, resolveAddress]);

	return (
		<div className="appShell">
		<Header account={account} onConnect={connectWallet} />
		<main className="pageBody">
		<Routes>
			<Route path="/" element={<Home contract={jobBoard} account={account} />} />
			<Route path="/post" element={<Post contract={jobBoard} account={account} />} />
			<Route path="/applications/:jobId" element={<Applications contract={jobBoard} account={account} />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
		</main>
		<Footer />
		</div>
	);
}
