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
                    primary: "#7427A5", // Púrpura Somos Dos
                    secondary: "#193BB3", // Azul Somos Dos
                    accent: "#60A5FA", // Azul Claro Acento
                    dark: "#030014", // Fondo Ultra Dark
                    surface: "#0A071E", // Superficie Card Dark
                },
                // Mapeo temporal para evitar rupturas de estilos antiguos
                maoly: {
                    primary: "#7427A5",
                    light: "#9333EA",
                    white: "#FFFFFF",
                    gray: {
                        light: "#0F172A",
                        medium: "#1E293B",
                    },
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-jakarta)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
