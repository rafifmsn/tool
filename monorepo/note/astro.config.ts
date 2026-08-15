import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
export default defineConfig({
  site: "https://note.rafifmsn.com",
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: [
          "mermaid",
          "shiki",
        ],
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-sans",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"],
      display: "swap",
    },
  ],
  integrations: [mdx(), sitemap()],
  markdown: {
    unified: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  trailingSlash: "never",
  build: {
    format: "file",
  },
});
