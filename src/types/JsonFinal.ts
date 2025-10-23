type LineCoverage = {
	[lineNumber: string]: number;
};

type FileCoverageReport = {
	path: string;
	lines: LineCoverage;
};

type JsonFinal = {
	[path: string]: FileCoverageReport;
};

export type {
	JsonFinal,
	FileCoverageReport,
	LineCoverage,
};
