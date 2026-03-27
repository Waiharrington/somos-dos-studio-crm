import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    primary: "#7C3AED", // Violeta Corporativo
                    secondary: "#10B981", // Verde Esmeralda
                    dark: "#09090B",
                    surface: "#18181B",
                },
                // Mantenemos 'maoly' temporalmente mapeado a 'brand' para no romper todo de golpe
                maoly: {
                    primary: "#7C3AED",
                    light: "#8B5CF6",
                    white: "#FFFFFF",
                    gray: {
                        light: "#27272A",
                        medium: "#3F3F46",
                    },
                },
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
