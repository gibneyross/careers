/** @type {import('tailwindcss').Config} */
export default {
	content: [//scan for classes
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			colors: { brand: { DEFAULT: "#00d1b2", dark: "#009e8f" } }//custom colour
  		  },
	},
	plugins: [],
}
