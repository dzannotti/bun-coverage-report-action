import type {
	JsonFinal,
	LineCoverage,
} from "./JsonFinal";

type LineConfig = { line: number; covered: boolean };
const createJsonFinalEntry = (
	fileName: string,
	lineConfigs: LineConfig[],
): JsonFinal => {
	const lines: LineCoverage = lineConfigs.reduce((obj: LineCoverage, lineConfig) => {
		obj[lineConfig.line] = lineConfig.covered ? 1 : 0;
		return obj;
	}, {});

	return {
		[fileName]: {
			path: fileName,
			lines,
		},
	};
};

const defaultJsonFinal: JsonFinal = {
	...createJsonFinalEntry("src/exampleFile.ts", [{ line: 1, covered: false }]),
};

const createTestJsonFinal = (overwrites: Partial<JsonFinal> = {}): JsonFinal =>
	({
		...defaultJsonFinal,
		...overwrites,
	}) as JsonFinal;

export { createTestJsonFinal, createJsonFinalEntry };
