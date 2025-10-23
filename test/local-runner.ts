#!/usr/bin/env node
/**
 * Local test harness for the Bun Coverage Report Action
 *
 * This script allows you to test the action locally without pushing to GitHub.
 * It sets up mock GitHub context and environment variables, then runs the action.
 *
 * Usage: npm run test:local
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Set up mock GitHub context environment variables
process.env.GITHUB_WORKSPACE = process.cwd();
process.env.GITHUB_REPOSITORY = "dzannotti/bun-coverage-report-action";
process.env.GITHUB_SHA = "abc123def456";
process.env.GITHUB_REF = "refs/heads/main";
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_RUN_ID = "123456";
process.env.GITHUB_RUN_NUMBER = "42";
process.env.GITHUB_SERVER_URL = "https://github.com";
process.env.GITHUB_TOKEN = "mock-token-for-local-testing";

// Set up action inputs
process.env.INPUT_LCOV_FILE = "coverage/lcov.info";
process.env.INPUT_FILE_COVERAGE_MODE = "all";
process.env.INPUT_WORKING_DIRECTORY = "./";
process.env.INPUT_NAME = "";
process.env.INPUT_COMMENT_ON = "none"; // Don't try to comment on PRs/commits locally
process.env["INPUT_GITHUB-TOKEN"] = "mock-token";
process.env["INPUT_FILE-COVERAGE-MODE"] = "all";
process.env["INPUT_WORKING-DIRECTORY"] = "./";
process.env["INPUT_COMMENT-ON"] = "none";

// Mock GitHub event payload
const mockEvent = {
	repository: {
		name: "bun-coverage-report-action",
		owner: {
			login: "dzannotti",
		},
	},
	head_commit: {
		id: "abc123def456",
	},
};

const eventPath = path.join(process.cwd(), "github-event.json");
fs.writeFileSync(eventPath, JSON.stringify(mockEvent, null, 2));
process.env.GITHUB_EVENT_PATH = eventPath;

console.log("🧪 Running Bun Coverage Report Action locally...\n");
console.log("Environment:");
console.log("  GITHUB_WORKSPACE:", process.env.GITHUB_WORKSPACE);
console.log("  GITHUB_REPOSITORY:", process.env.GITHUB_REPOSITORY);
console.log("  GITHUB_SHA:", process.env.GITHUB_SHA);
console.log("  INPUT_LCOV_FILE:", process.env["INPUT_LCOV-FILE"]);
console.log("");

// Import and run the action
import("../src/index.js")
	.then(() => {
		console.log("\n✅ Action completed successfully!");
		console.log("\nCheck the output above for the generated coverage report.");

		// Clean up
		fs.unlinkSync(eventPath);
	})
	.catch((error) => {
		console.error("\n❌ Action failed:");
		console.error(error);

		// Clean up
		if (fs.existsSync(eventPath)) {
			fs.unlinkSync(eventPath);
		}
		process.exit(1);
	});
