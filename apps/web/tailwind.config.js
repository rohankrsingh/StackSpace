const { heroui } = require("@heroui/react");
const path = require("path");

// Locate HeroUI theme path dynamically to handle monorepo hoisting
let heroUIPath;
try {
    heroUIPath = path.dirname(require.resolve("@heroui/theme/package.json"));
} catch (e) {
    // Fallback to relative path if resolution fails
    heroUIPath = "../../node_modules/@heroui/theme";
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        `${heroUIPath}/dist/**/*.{js,ts,jsx,tsx}`,
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [heroui()],
};
