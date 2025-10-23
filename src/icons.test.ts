import { describe, expect, it } from "vitest";
import { icons, getIcon, getCoverageEmoji } from "./icons";

describe("getIcon()", () => {
	it("returns the correct icon for a given name", () => {
		expect(getIcon("red")).toBe("🔴");
		expect(getIcon("green")).toBe("🟢");
		expect(getIcon("party")).toBe("🎉");
	});
});

describe("getCoverageEmoji()", () => {
	it("returns increase emoji when coverage improved", () => {
		expect(getCoverageEmoji(80, 70)).toBe(icons.increase);
	});

	it("returns decrease emoji when coverage dropped", () => {
		expect(getCoverageEmoji(60, 70)).toBe(icons.decrease);
	});

	it("returns equal emoji when coverage stayed the same", () => {
		expect(getCoverageEmoji(75, 75)).toBe(icons.equal);
	});
});
