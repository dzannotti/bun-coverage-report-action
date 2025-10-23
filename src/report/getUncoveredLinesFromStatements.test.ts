import { describe, expect, it } from "vitest";
import type { LineCoverage } from "../types/JsonFinal";
import { getUncoveredLinesFromStatements } from "./getUncoveredLinesFromStatements";

describe("getUncoveredLinesFromStatements()", () => {
	it("returns a single line range for only one untested line.", () => {
		const lineCoverage: LineCoverage = {
			"1": 0,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([
			{
				start: 1,
				end: 1,
			},
		]);
	});

	it("returns an empty array if only line is covered.", () => {
		const lineCoverage: LineCoverage = {
			"1": 1,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([]);
	});

	it("returns a linge range of 3 lines if all statements are uncovered.", () => {
		const lineCoverage: LineCoverage = {
			"1": 0,
			"2": 0,
			"3": 0,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([
			{
				start: 1,
				end: 3,
			},
		]);
	});

	it("returns two line ranges if statements are interrupted by covered line.", () => {
		const lineCoverage: LineCoverage = {
			"1": 0,
			"2": 1,
			"3": 0,
			"4": 0,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([
			{ start: 1, end: 1 },
			{ start: 3, end: 4 },
		]);
	});

	it("returns multiple ranges if line numbers are not sequential.", () => {
		const lineCoverage: LineCoverage = {
			"1": 0,
			"6": 0,
			"7": 0,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([
			{ start: 1, end: 1 },
			{ start: 6, end: 7 },
		]);
	});

	it("handles the case where the hit count is greater than 1.", () => {
		const lineCoverage: LineCoverage = {
			"1": 2,
			"2": 8,
		};

		const uncoveredLines = getUncoveredLinesFromStatements(lineCoverage);

		expect(uncoveredLines).toEqual([]);
	});
});
