import { readFile } from "node:fs/promises";
import path from "node:path";
import * as core from "@actions/core";
import { stripIndent } from "common-tags";
import { lcovParser } from "@friedemannsommer/lcov-parser";
import type { JsonFinal } from "../types/JsonFinal";
import type { JsonSummary, ReportNumbers } from "../types/JsonSummary";

const parseLcovReport = async (
	lcovPath: string,
): Promise<{ summary: JsonSummary; final: JsonFinal }> => {
	try {
		const resolvedLcovPath = path.resolve(process.cwd(), lcovPath);
		const lcovContent = await readFile(resolvedLcovPath, "utf-8");
		const lcovData = await lcovParser({ from: lcovContent });

		const summary: JsonSummary = { total: { lines: { total: 0, covered: 0, skipped: 0, pct: 0 }, functions: { total: 0, covered: 0, skipped: 0, pct: 0 } } };
		const final: JsonFinal = {};

		for (const section of lcovData) {
			const filePath = section.path;

			const linesTotal = section.lines.instrumented;
			const linesCovered = section.lines.hit;
			const functionsTotal = section.functions.instrumented;
			const functionsCovered = section.functions.hit;

			const linesReport: ReportNumbers = {
				total: linesTotal,
				covered: linesCovered,
				skipped: 0,
				pct: linesTotal > 0 ? (linesCovered / linesTotal) * 100 : 0,
			};

			const functionsReport: ReportNumbers = {
				total: functionsTotal,
				covered: functionsCovered,
				skipped: 0,
				pct: functionsTotal > 0 ? (functionsCovered / functionsTotal) * 100 : 0,
			};

			summary[filePath] = {
				lines: linesReport,
				functions: functionsReport,
			};

			summary.total.lines.total += linesTotal;
			summary.total.lines.covered += linesCovered;
			summary.total.functions.total += functionsTotal;
			summary.total.functions.covered += functionsCovered;

			const lineCoverage: Record<string, number> = {};
			for (const lineDetail of section.lines.details) {
				lineCoverage[lineDetail.line] = lineDetail.hit;
			}

			final[filePath] = {
				path: filePath,
				lines: lineCoverage,
			};
		}

		summary.total.lines.pct =
			summary.total.lines.total > 0
				? (summary.total.lines.covered / summary.total.lines.total) * 100
				: 0;
		summary.total.functions.pct =
			summary.total.functions.total > 0
				? (summary.total.functions.covered / summary.total.functions.total) * 100
				: 0;

		return { summary, final };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to parse LCOV file at "${lcovPath}": ${message}`);
	}
};

export { parseLcovReport };
