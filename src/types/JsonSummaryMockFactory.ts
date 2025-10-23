import type { CoverageReport, JsonSummary, ReportNumbers } from "./JsonSummary";

const defaultReportNumbers: ReportNumbers = {
	total: 100,
	covered: 5,
	pct: 5,
	skipped: 0,
};

const createMockReportNumbers = (
	overwrites: Partial<ReportNumbers> = {},
): ReportNumbers => ({
	...defaultReportNumbers,
	...overwrites,
});

const defaultReport: CoverageReport = {
	lines: createMockReportNumbers(),
	functions: createMockReportNumbers(),
};

const createMockCoverageReport = (
	overwrites: Partial<CoverageReport> = {},
): CoverageReport =>
	({
		...defaultReport,
		...overwrites,
	}) as CoverageReport;

const defaultJsonSummary: JsonSummary = {
	total: createMockCoverageReport({
		functions: createMockReportNumbers({
			total: 100,
			covered: 30,
			pct: 30,
		}),
		lines: createMockReportNumbers({
			total: 100,
			covered: 40,
			pct: 40,
		}),
	}),
};

const createMockJsonSummary = (
	overwrites: Partial<JsonSummary> = {},
): JsonSummary =>
	({
		...defaultJsonSummary,
		...overwrites,
	}) as JsonSummary;

export {
	createMockJsonSummary,
	createMockReportNumbers,
	createMockCoverageReport,
};
