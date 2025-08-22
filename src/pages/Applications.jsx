// src/pages/Applications.jsx
import { useEffect, useState, useMemo } from "react"; //react hooks
import { useParams, Link } from "react-router-dom"; //router

export default function Applications({ contract, account }) {
	const { jobId } = useParams(); //job id from route
	const [job, setJob] = useState(null); //job state
	const [apps, setApps] = useState([]); //applications state
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");
	const isPoster = useMemo(() => {// check if caller is employer
		if (!job || !account) return false;
		return job.employer?.toLowerCase() === account.toLowerCase();
	}, [job, account]);

	useEffect(() => {// load job + applications
		let mounted = true;
		(async () => {
			if (!contract || !jobId) return;
			setLoading(true);
			setErr("");
		try {
			const allJobs = await contract.getJobs(); //all jobs
			const idx = Number(jobId) - 1;
			const theJob = allJobs?.[idx];
			if (!theJob) throw new Error("Job not found");
			const normalizedJob = {
				id: Number(theJob.id ?? jobId),
				employer: theJob.employer,
				company: theJob.company,
				position: theJob.position,
				active: Boolean(theJob.active),
		};
		const raw = await contract.getApplications(Number(jobId));//get applications
		const normalized = (raw || []).map((a, i) => ({
			n: i + 1,
			applicant: a.applicant,
			note: a.note,
			appliedAt: Number(a.appliedAt ?? 0),
		}));
		if (mounted) {
			setJob(normalizedJob);
			setApps(normalized);
		}
	} catch (e) {
		if (mounted) setErr(e?.message || "Failed to load applications");
	} finally {
		if (mounted) setLoading(false);
	}
	})();
	return () => { mounted = false; }; // cleanup
}, [contract, jobId]);

	const wrap = { maxWidth: 800, margin: "0 auto", padding: "1rem" }; //wrapper style
	const card = { border: "1px solid black", borderRadius: 8, padding: "1rem", marginBottom: "1rem", background: "#fafafa" }; //card style
	const tag = { display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: 12, fontSize: 12, background: job?.active ? "black" : "black", border: `1px solid ${job?.active ? "black" : "black"}`, marginLeft: 8 }; //status tag style
	return (
		<div style={wrap}>
			<div style={{ marginBottom: "1rem"}}>
				<Link to="/" style={{ textDecoration: "none" }}>← Return to listings</Link> {/* back link */}
			</div>
			<h2 style={{ margin: 0 }}>Applications for Job #{jobId}</h2>
			{job && ( //job info
			<p style={{ marginTop: "0.5rem", opacity: 1 }}>
				<strong>{job.company}</strong> — {job.position}
				<br />
				Poster: {job.employer}
			</p>
			)}
			{loading && <p>Loading…</p>} {/* loading */}
			{err && <p style={{ color: "black" }}>{err}</p>} {/* error */}
			{!loading && !err && apps.length === 0 && ( //no apps
			<div style={{ opacity: 0.7 }}>No applications yet for this job.</div>
	)}
	{!loading && !err && apps.length > 0 && ( //apps list
	<div>
		{!isPoster && ( // warning if not poster
		<div style={{ ...card, borderColor: "#fde68a", background: "#fffbeb" }}>
			<strong>Note:</strong> You are not the employer who posted this job. You can view applications, but actions (if any) should be restricted to the poster.
		</div>
		)}
		{apps.map((a) => ( // each application
		<div key={a.n} style={card}>
			<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
				<div>
					<strong>Applicant</strong><br />
					<span style={{ wordBreak: "break-all" }}>{a.applicant}</span>
				</div>
				<div style={{ textAlign: "right", minWidth: 180 }}>
					<strong>Applied</strong><br />
					{a.appliedAt ? new Date(a.appliedAt * 1000).toLocaleString() : "—"}
				</div>
			</div>
			<div>
				<strong>Cover Note</strong>
				<div style={{ marginTop: 6, padding: "0.75rem", border: "1px solid black", borderRadius: 8, background: "white", whiteSpace: "pre-wrap" }}>
					{a.note || "(no note provided)"}
				</div>
			</div>
		</div>
		))}
	</div>
	)}
</div>
 );
}
