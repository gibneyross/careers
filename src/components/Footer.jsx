import "./Footer.css";

function Footer() {
	return (
		<footer className="footerBar">
			<p className="footerText">&copy; 2025 Irish Web3 Careers. All rights reserved.</p>
			<div className="socialLinks">
				<a className="linkBtn" href="https://x.com" target="_blank" rel="noopener noreferrer">X</a>
				<a className="linkBtn" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
				<a className="linkBtn" href="mailto:support@irishweb3careers.com">Contact</a>
			</div>
		</footer>
	);
}
export default Footer;
