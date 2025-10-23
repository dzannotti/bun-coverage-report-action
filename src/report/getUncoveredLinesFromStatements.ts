import type { LineCoverage } from "../types/JsonFinal";

type LineRange = {
	start: number;
	end: number;
};

const getUncoveredLinesFromStatements = (
	lineCoverage: LineCoverage,
): LineRange[] => {
	const lineNumbers = Object.keys(lineCoverage).map(Number).sort((a, b) => a - b);

	const uncoveredLineRanges: LineRange[] = [];
	let currentRange: LineRange | undefined = undefined;

	for (const lineNumber of lineNumbers) {
		const hitCount = lineCoverage[lineNumber];

		if (hitCount > 0) {
			// If the line is covered, we need to close the current range.
			if (currentRange) {
				uncoveredLineRanges.push(currentRange);
				currentRange = undefined;
			}
			// Besides that, we can just ignore covered lines
			continue;
		}

		// Start a new range if we don't have one yet.
		if (!currentRange) {
			currentRange = {
				start: lineNumber,
				end: lineNumber,
			};
			continue;
		}

		// Extend the current range if this line is consecutive
		if (lineNumber === currentRange.end + 1) {
			currentRange.end = lineNumber;
		} else {
			// Otherwise, close the current range and start a new one
			uncoveredLineRanges.push(currentRange);
			currentRange = {
				start: lineNumber,
				end: lineNumber,
			};
		}
	}

	// If we still have a current range, we need to add it to the uncovered line ranges.
	if (currentRange) {
		uncoveredLineRanges.push(currentRange);
	}

	return uncoveredLineRanges;
};

export { getUncoveredLinesFromStatements };

export type { LineRange };
