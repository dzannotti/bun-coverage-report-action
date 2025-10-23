import { describe, expect, it } from "vitest";
import { getTableLine } from "../../test/queryHelper";
import {
	createMockCoverageReport,
	createMockReportNumbers,
} from "../types/JsonSummaryMockFactory";
import { generateSummaryTableHtml } from "./generateSummaryTableHtml";

describe("generateSummaryTabelHtml()", () => {
	it("generates the headline", () => {
		const mockReport = createMockCoverageReport();
		const summaryHtml = generateSummaryTableHtml(mockReport, undefined);
		const headline = getTableLine(0, summaryHtml);

		expect(headline).toContain("Category");
		expect(headline).toContain("Percentage");
		expect(headline).toContain("Covered / Total");
	});

	it("generates all categories as rows", async (): Promise<void> => {
		const mockReport = createMockCoverageReport();
		const summaryHtml = generateSummaryTableHtml(mockReport, undefined);

		expect(getTableLine(1, summaryHtml)).toContain("Lines");
		expect(getTableLine(2, summaryHtml)).toContain("Functions");
	});

	it("adds the percentage with a %-sign.", async (): Promise<void> => {
		const mockReport = createMockCoverageReport({
			lines: createMockReportNumbers({ pct: 80 }),
		});

		const summaryHtml = generateSummaryTableHtml(mockReport, undefined);

		expect(getTableLine(1, summaryHtml)).toContain("80%");
	});

	it("shows the covered / total numbers.", async (): Promise<void> => {
		const mockReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				covered: 8,
				total: 10,
			}),
		});

		const summaryHtml = generateSummaryTableHtml(mockReport, undefined);

		expect(getTableLine(1, summaryHtml)).toContain("8 / 10");
	});

	it("if compare report is given and coverage decreased, provides the difference in the percentage column.", async (): Promise<void> => {
		const mockReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 80,
			}),
		});
		const mockCompareReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 90,
			}),
		});

		const summaryHtml = generateSummaryTableHtml(mockReport, mockCompareReport);

		expect(getTableLine(1, summaryHtml)).toContain(
			"80%<br/>⬇️ <em>-10.00%</em>",
		);
	});

	it("if compare report is given and coverage increased, provides the difference in the percentage column.", async (): Promise<void> => {
		const mockReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 90,
			}),
		});
		const mockCompareReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 80,
			}),
		});

		const summaryHtml = generateSummaryTableHtml(mockReport, mockCompareReport);

		expect(getTableLine(1, summaryHtml)).toContain(
			"90%<br/>⬆️ <em>+10.00%</em>",
		);
	});

	it("if compare report is given and coverage stayed the same, provides the difference in the percentage column.", async (): Promise<void> => {
		const mockReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 90,
			}),
		});
		const mockCompareReport = createMockCoverageReport({
			lines: createMockReportNumbers({
				pct: 90,
			}),
		});

		const summaryHtml = generateSummaryTableHtml(mockReport, mockCompareReport);

		expect(getTableLine(1, summaryHtml)).toContain("90%<br/>🟰 <em>±0%</em>");
	});
});
