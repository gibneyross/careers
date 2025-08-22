import { Link } from "react-router-dom";
import "./Header.css";
function Header({ account, onConnect }) {
	const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");//shorten address
	return (
		<header className="headerBar">
		{/* Group title + flag together */}
		<div className="brandGroup">
		<h1 className="logoText">Irish Web3 Careers</h1>
		<img src="/flag.png" alt="Ireland Flag" className="flagIcon" />
		</div>
		<div className="rightSide">
			<nav className="navLinks">
				<Link className="link" to="/">Home</Link>
				<Link className="link" to="/post">Post Job</Link>
			</nav>
		<div className="walletArea">
		{account ? (
		<>
		<span className="addrChip">{short(account)}</span>
		<span className="connectedText">Connected</span>
		</>
		) : (
		<button className="walletBtn" onClick={onConnect}>
			Connect Wallet
		</button>
		)}
		</div>
		</div>
		</header>
	);
}
export default Header;
