type ReportNumbers = {
	total: number;
	covered: number;
	skipped: number;
	pct: number;
};

type CoverageReport = {
	lines: ReportNumbers;
	functions: ReportNumbers;
};

type JsonSummary = {
	total: CoverageReport;
	[filePath: string]: CoverageReport;
};

export type { JsonSummary, ReportNumbers, CoverageReport };
