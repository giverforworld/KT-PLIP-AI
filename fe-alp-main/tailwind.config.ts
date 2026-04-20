import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/containers/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			boxShadow: {
				"custom-light": "2px 1px 8px rgba(238,238,238,1)",
				"gis-custom": "0 1px 8px rgba(224, 25, 52, 0.1)",
				"active-box-shadow": "0px 1px 8px 0px rgba(236, 39, 52, 0.09)",
			},
			colors: {
				primary: {
					DEFAULT: "#D63457",
					light: "rgba(214, 52, 87, 0.06)",
				},
				black: "#333333",
				blackSecondary: "#3A3A3A",
				darkModeBackGary: "#121216",
				darkModeBoxGray: "#212124",
				darkModeMapBackGray: "#0D0D10",
				whiteGray: "#FAFAFA",
				lightGray: "#F5F6F8",
				extraLightGray: "#EFEFEF",
				backGray: "#F8F8F8",
				boxGray: "#EFEFEF",
				shadowBoxGray: "#eeeeee",
				tabGray: "#F5F5F5",
				borderGray: "#DDDDDD",
				bgGrey: "#949494E5",
				buttonGray: "#F0F0F0",
				textGray: "#7D7D7D",
				textLightGray: "#999999",
				textBlue: "#365D96",
				subText: "#555555",
				stroke: "#E7E7E7",
				error: "#EC2734",
				blue: "#2F80ED",
				green: "#6CBFAB",
				focus: "#119891",
				chartFocus: "#D63457",
				tableGray: "#F3F3F3",
				tableBlue: "#418AEC",
				th: "#E5E7EB",
				disAbled: "#A3A4A5",
				filterLightGray: "#E4E4E4",
				filterGray: "#B9B9B9",
				filterDarkGray: "#444444",
			},
			fontFamily: {
				pretendard: ["Pretendard", "sans-serif"],
			},
			spacing: {
				"7": "1.75rem",
				"8": "2rem",
				"9": "2.25rem",
				"10": "2.5rem",
			},
			keyframes: {
				"slide-down": {
					"0%": { top: "-50px", opacity: "0" },
					"100%": { top: "20px", opacity: "1" },
				},
			},
			animation: {
				"slide-down": "slide-down 0.5s ease-out forwards",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			filter: {
				"opacity-50": "opacity(0.5)",
			},
			width: {
				inherit: "inherit",
			},
			height: {
				inherit: "inherit",
			},
			gridTemplateColumns: {
				13: "repeat(13, minmax(0, 1fr))",
			},
		},
	},
	plugins: [require("tailwindcss-filters")],
};

export default config;
