import * as path from "node:path";
import * as core from "@actions/core";
import type { Octokit } from "../octokit";
import { type FileCoverageMode, getCoverageModeFrom } from "./FileCoverageMode";
import { type CommentOn, getCommentOn } from "./getCommentOn";
import { getCommitSHA } from "./getCommitSHA";
import { getPullRequestNumber } from "./getPullRequestNumber";

type Options = {
	fileCoverageMode: FileCoverageMode;
	lcovFile: string;
	lcovFileCompare: string | null;
	name: string;
	workingDirectory: string;
	prNumber: number | undefined;
	commitSHA: string;
	commentOn: Array<CommentOn>;
	fileCoverageRootPath: string;
};

async function readOptions(octokit: Octokit): Promise<Options> {
	// Working directory can be used to modify all default/provided paths (for monorepos, etc)
	const workingDirectory = core.getInput("working-directory");

	const fileCoverageModeRaw = core.getInput("file-coverage-mode"); // all/changes/none
	const fileCoverageMode = getCoverageModeFrom(fileCoverageModeRaw);

	const lcovFile = path.resolve(
		workingDirectory,
		core.getInput("lcov-file"),
	);

	const lcovFileCompareInput = core.getInput("lcov-file-compare");
	let lcovFileCompare: string | null = null;
	if (lcovFileCompareInput) {
		lcovFileCompare = path.resolve(
			workingDirectory,
			lcovFileCompareInput,
		);
	}

	const name = core.getInput("name");

	const commentOn = getCommentOn();

	const commitSHA = getCommitSHA();

	let prNumber: number | undefined = undefined;
	if (commentOn.includes("pr")) {
		// Get the user-defined pull-request number and perform input validation
		prNumber = await getPullRequestNumber(octokit);
	}

	const fileCoverageRootPath = core.getInput("file-coverage-root-path");

	return {
		fileCoverageMode,
		lcovFile,
		lcovFileCompare,
		name,
		workingDirectory,
		prNumber,
		commitSHA,
		commentOn,
		fileCoverageRootPath,
	};
}

export { readOptions };

export type { Options };
