const icons = {
	red: "🔴",
	green: "🟢",
	blue: "🔵",
	increase: "⬆️",
	decrease: "⬇️",
	equal: "🟰",
	target: "🎯",
	party: "🎉",
};

// Helper function to get icon by name
function getIcon(name: keyof typeof icons): string {
	return icons[name];
}

// Helper function to check if coverage increased
function getCoverageEmoji(current: number, previous: number): string {
	if (current > previous) return icons.increase;
	if (current < previous) return icons.decrease;
	return icons.equal;
}

export { icons, getIcon, getCoverageEmoji };
