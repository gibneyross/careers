import { useState } from "react"; // react hook
function Post({ contract, account }) {
	const [form, setForm] = useState({ // form state
	company: "",
	position: "",
	employmentType: "Full-time",
	requirements: "",
	salary: ""
});
const [status, setStatus] = useState(""); //status msg
const update = (k) => (e) => setForm({ ...form, [k]: e.target.value }); //update helper
const handleSubmit = async (e) => { //submit handler
	e.preventDefault();
	if (!contract) return setStatus("Wallet not connected.");
	if (!form.company || !form.position) return setStatus("Company and Position are required.");
	try {
		setStatus("Posting job…");
		const tx = await contract.postJob(
			form.company,
			form.position,
			form.employmentType,
			form.requirements,
			Number(form.salary || 0)
		);
		await tx.wait();
		setStatus("Job posted successfully!");
		setForm({ company: "", position: "", employmentType: "Full-time", requirements: "", salary: "" });
		} catch (err) {
			console.error(err);
			setStatus("Failed to post job");
		}
	};
	if (!contract || !account) { // no wallet
		return <p style={{ textAlign: "center" }}>Connecting to contract…</p>;
	}
	return (
		<div style={{ maxWidth: "700px", margin: "0 auto" }}>
		<h2>Post a Job</h2>
		<form onSubmit={handleSubmit}>
			<div style={{ border: "1px solid black", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", background: "white" }}>
				<label>
					<strong>Company Name *</strong><br />
					<input type="text" placeholder="e.g. FinFlow" value={form.company} onChange={update("company")} style={{ width: "100%", marginTop: "0.5rem", marginBottom: "1rem" }} required />
				</label>
				<label>
					<strong>Position *</strong><br />
					<input type="text" placeholder="e.g. Smart Contract Engineer" value={form.position} onChange={update("position")} style={{ width: "100%", marginTop: "0.5rem", marginBottom: "1rem"}} required />
				</label>
				<label>
				<strong>Employment Type</strong><br />
					<select value={form.employmentType} onChange={update("employmentType")} style={{ width: "100%", marginTop: "0.5rem", marginBottom: "1rem" }}>
						<option>Full-time</option>
						<option>Part-time</option>
						<option>Contract</option>
						<option>Internship</option>
						<option>Temporary</option>
					</select>
				</label>
				<label>
					<strong>Salary (EUR)</strong><br />
					<input type="number" min="0" placeholder="e.g. 50000" value={form.salary} onChange={update("salary")} style={{ width: "100%", marginTop: "0.5rem", marginBottom: "1rem" }} />
				</label>
				<label>
				<strong>Requirements</strong><br />
				<textarea rows="4" placeholder="e.g. Solidity Experience" value={form.requirements} onChange={update("requirements")} style={{ width: "100%", marginTop: "0.5rem", marginBottom: "1rem" }} />
				</label>
				<button type="submit" disabled={!account} style={{ marginTop: "1rem" }}>Post Job</button>
			</div>
		</form>
		<p>{status}</p> {/* status msg */}
	</div>
	);
}
export default Post;
