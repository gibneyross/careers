// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//@title JobBoard
//@notice job posting + application contract.
contract JobBoard {
	//@dev Represents a single job posting.
	struct Job {
		uint256 id;
		address employer;
		string company;
		string position;
		string employmentType;
		string requirements;
		uint256 salary;
		bool active;
	}
//@dev Represents an application to a specific job.
	struct Application {
		address applicant;
		string note;
		uint256 appliedAt;
	}
	// Storage of all jobs.
	Job[] public jobs;
	mapping(uint256 => Application[]) public applications;
	// Emitted when a job is posted.
	event JobPosted(uint256 indexed jobId, address indexed employer);
	// Emitted when an application is submitted.
	event Applied(uint256 indexed jobId, address indexed applicant);
//@notice Post a new job.
   
	function postJob(
		string memory company,
		string memory position,
		string memory employmentType,
		string memory requirements,
		uint256 salary
	)external {
		uint256 newId = jobs.length + 1;
		jobs.push(
			Job({
				id: newId,
				employer: msg.sender,
				company: company,
				position: position,
				employmentType: employmentType,
				requirements: requirements,
				salary: salary,
				active: true
			})
		);
		emit JobPosted(newId, msg.sender);
	}
//@notice Apply to an existing job.
	function applyToJob(uint256 jobId, string calldata note) external {
		require(jobId > 0 && jobId <= jobs.length, "bad id");
		Job storage j = jobs[jobId - 1];
		// Job must be active to accept applications.
		require(j.active, "closed");
		applications[jobId].push(
			Application({
				applicant: msg.sender,
				note: note,
				appliedAt: block.timestamp
			})
		);
		emit Applied(jobId, msg.sender);
	}
// @notice Return all jobs.
	function getJobs() external view returns(Job[] memory) {
		return jobs;
	}
	function getApplications(uint256 jobId) external view returns (Application[] memory) {
		return applications[jobId];
	}
}

