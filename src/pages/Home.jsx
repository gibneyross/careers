import { useEffect, useState } from "react"; // react hooks
import { useNavigate } from "react-router-dom"; // navigation

export default function Home({ contract, account }) {
	const [jobs, setJobs] = useState([]);
	const [coverNotes, setCoverNotes] = useState({}); // cover notes state
	const [cvFiles, setCvFiles] = useState({}); // cv files state
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate(); // router hook
	const container = { maxWidth: 700, margin: "0 auto",textAlign: "center"};
	const card = {border: "1px solid black", borderRadius: 8, padding: "1rem", marginBottom: "1.25rem", background: "#f9f9f9", width: "100%", boxSizing: "border-box" }; //card style
	const label = {fontWeight: 600, display: "block", marginBottom: "0.25rem", textAlign: "left" }; // label style
	const input = {width: "100%", boxSizing: "border-box", marginTop: "0.25rem", marginBottom: "0.75rem", padding: "0.5rem 0.6rem", borderRadius: 8, border: "1px solid black", background: "white" }; //input style
	const readOnlyInput = { ...input, background: "white" };
	const smallMeta = { marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.7, wordBreak: "break-all"};

	const load = async () => { // load jobs
		if (!contract) return;
		try {
			let all;
			try { all = await contract.getJobs(); } catch { all = await contract.getAllJobs?.(); }
			if (!all) return;
			const normalized = all.map((j, idx) => ({
			jobId: Number(j.id ?? 0) || idx + 1,
			employer: j.employer,
			company: j.company,
			position: j.position,
			employmentType: j.employmentType,
			requirements: j.requirements,
			salary: Number(j.salary ?? 0),
			postedAt: Number(j.postedAt ?? 0),
			active: j.active ?? true,
		}));
		setJobs(normalized.reverse());
		} catch (e) { console.error("Failed to load jobs", e); }
		};
	useEffect(() => { load(); }, [contract]); // reload on contract change
	useEffect(() => { // listen for events
		if (!contract) return;
		const onPosted = async () => { await load(); };
		try { contract.on?.("JobPosted", onPosted); } catch {}
		const id = setInterval(load, 10000);
		return () => { try { contract.off?.("JobPosted", onPosted); } catch {}; clearInterval(id); };
	}, [contract]);
	const apply = async (jobId) => { //apply handler
		if (!contract) return alert("Connect wallet first");
		const note = (coverNotes[jobId] || "").trim();
		if (cvFiles[jobId]) { console.warn("CV selected (not uploaded on-chain):", cvFiles[jobId]); }
		setLoading(true);
		try {
			const tx = await contract.applyToJob(jobId, note);
			await tx.wait?.();
			setCoverNotes({ ...coverNotes, [jobId]: "" });
			setCvFiles({ ...cvFiles, [jobId]: null });
			alert("Application submitted!");
		} catch (e) {
			console.error(e);
			alert(e?.reason || e?.message || "Transaction failed");
		} finally { setLoading(false); }
};

	return (
		<div style={container}>
			<section style={card}> {/* intro section */}
			<h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Welcome to Irish Web3 Careers</h1>
			<p style={{ color: "black", lineHeight: 1.55, margin: 0 }}>
				This is a community board for blockchain, cloud, and cybersecurity roles across Ireland.
				To post a job, click <strong>Post Job</strong> in the header, fill in the form, and confirm the
				MetaMask transaction. To apply for a role, open a listing below, write a brief cover note,
				optionally attach your CV, and press <strong>Apply</strong>. New posts appear automatically, no refresh needed.
				To <strong>View</strong> applications, ensure the address connected is the same address that posted the job and click <strong>View Applications</strong> in 				the job istings below.
			</p>
			</section>

		<section> {/* job listings */}
		<h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>Latest Job Openings</h2>
		{jobs.length === 0 ? (
			<div style={{opacity:1 }}>No jobs yet. Be the first to post!</div>
			) : (
			jobs.map((j) => (
				<div key={j.jobId} style={{ ...card, textAlign: "left" }}>
				<label style={label}>Company</label>
				<input style={readOnlyInput} value={j.company} readOnly />
				<label style={label}>Position</label>
				<input style={readOnlyInput} value={j.position} readOnly />
				<label style={label}>Employment Type</label>
				<input style={readOnlyInput} value={j.employmentType} readOnly />
				<label style={label}>Salary (EUR)</label>
				<input style={readOnlyInput} value={Number.isFinite(j.salary) ? j.salary.toString() : ""} readOnly />
				<label style={label}>Requirements</label>
				<textarea rows={4} style={{ ...readOnlyInput, resize: "vertical" }} value={j.requirements || ""} readOnly />
				{account?.toLowerCase() === j.employer?.toLowerCase() && ( //employer-only
				<div style={{ textAlign: "right", marginTop: "0.5rem" }}>
					<button type="button" onClick={() => navigate(`/applications/${j.jobId}`)} style={{ background: "#e5e7eb", border: "1px solid black", borderRadius: 8, padding: "0.4rem 0.8rem", cursor: "pointer", marginBottom: "0.5rem" }}>
					View Applications
					</button>
				</div>
			)}
			{j.active && ( // apply form
			<form onSubmit={(e) => { e.preventDefault(); apply(j.jobId); }} style={{ marginTop: "0.5rem" }}>
				<label style={label}>Cover Note</label>
				<textarea rows={4} placeholder="Describe why you are a fit for this job" style={input} value={coverNotes[j.jobId] || ""} onChange={(e) => setCoverNotes({ ...coverNotes, [j.jobId]: e.target.value })} />
				<label style={label}>Attach CV (PDF/DOC/DOCX)</label>
				<input type="file" accept=".pdf,.doc,.docx" style={input} onChange={(e) => setCvFiles({ ...cvFiles, [j.jobId]: e.target.files?.[0] || null })} />
				<div style={{ textAlign: "right" }}>
				<button type="submit" disabled={loading || !account} style={{ background: "#e5e7eb", border: "1px solid black", borderRadius: 8, padding: "0.5rem 0.9rem", cursor: loading || !account ? "not-allowed" : "pointer", transition: "background-color .15s ease" }} onMouseOver={(e) => (e.currentTarget.style.background = "#d1d5db")} onMouseOut={(e) => 				(e.currentTarget.style.background = "#e5e7eb")}>
				{loading ? "Submitting…" : "Apply"}
				</button>
				</div>
			</form>
			)}
			<div style={smallMeta}> {/* job meta */}
				Employer: {j.employer}
				{j.postedAt ? ` • Posted: ${new Date(j.postedAt * 1000).toLocaleString()}` : ""}
			</div>
			</div>
			))
		)}
		</section>
	</div>
	);
}
