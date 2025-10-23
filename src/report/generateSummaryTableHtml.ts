import { oneLine } from "common-tags";
import { icons } from "../icons";
import type { CoverageReport, ReportNumbers } from "../types/JsonSummary";
import { getCompareString } from "./getCompareString";

function generateSummaryTableHtml(
	jsonReport: CoverageReport,
	jsonCompareReport: CoverageReport | undefined = undefined,
): string {
	return oneLine`
		<table>
			<thead>
				<tr>
				 <th align="left">Category</th>
				 <th align="right">Percentage</th>
				 <th align="right">Covered / Total</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					${generateTableRow({ reportNumbers: jsonReport.lines, category: "Lines", reportCompareNumbers: jsonCompareReport?.lines })}
				</tr>
				<tr>
					${generateTableRow({ reportNumbers: jsonReport.functions, category: "Functions", reportCompareNumbers: jsonCompareReport?.functions })}
				</tr>
			</tbody>
		</table>
	`;
}

function generateTableRow({
	reportNumbers,
	category,
	reportCompareNumbers,
}: {
	reportNumbers: ReportNumbers;
	category: string;
	reportCompareNumbers?: ReportNumbers;
}): string {
	let percent = `${reportNumbers.pct}%`;

	if (reportCompareNumbers) {
		const percentDiff = reportNumbers.pct - reportCompareNumbers.pct;
		const compareString = getCompareString(percentDiff);
		percent = `${percent}<br/>${compareString}`;
	}

	return `
    <td align="left">${category}</td>
		<td align="right">${percent}</td>
    <td align="right">${reportNumbers.covered} / ${reportNumbers.total}</td>
  `;
}

export { generateSummaryTableHtml };
