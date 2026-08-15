/**
 * Preview — unified pipeline renderer for markdown.
 * Receives markdown string, renders HTML, optionally renders mermaid blocks.
 */

import { renderMarkdown, containsMermaid } from "./markdown";
import { codeToHtml } from "shiki";
import mermaid from "mermaid";

// ── Native Engine Configuration for Tight Wrapping ──
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
  },
});

export class Preview {
  private container: HTMLElement;
  private _markdown = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.className = "md-preview";
  }

  async update(markdown: string): Promise<void> {
    this._markdown = markdown;

    if (!markdown.trim()) {
      this.container.innerHTML = `<div class="flex items-center justify-center h-full text-text-muted text-sm">
        <p>Start typing to see the preview</p>
      </div>`;
      return;
    }

    try {
      let html = await renderMarkdown(markdown);

      if (markdown.includes("```")) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const codeBlocks = doc.querySelectorAll("pre code");

        for (const codeEl of codeBlocks) {
          const preEl = codeEl.parentElement;
          if (!preEl) continue;

          if (
            codeEl.className.includes("language-mermaid") ||
            preEl.className.includes("mermaid")
          ) {
            const rawChartText = codeEl.textContent || "";
            preEl.className = "mermaid mermaid-block";
            preEl.textContent = rawChartText;
            continue;
          }

          const codeText = codeEl.textContent || "";
          const langClass = Array.from(codeEl.classList).find((c) =>
            c.startsWith("language-"),
          );
          const lang = langClass ? langClass.replace("language-", "") : "text";

          try {
            const highlightedHtml = await codeToHtml(codeText, {
              lang: lang,
              theme: "github-dark",
            });
            preEl.outerHTML = highlightedHtml;
          } catch (e) {
            console.warn(`Shiki highlight fallback for language: ${lang}`, e);
          }
        }
        html = doc.body.innerHTML;
      }

      this.container.innerHTML = html;

      if (containsMermaid(markdown)) {
        try {
          const activeNodes =
            this.container.querySelectorAll<HTMLElement>(".mermaid-block");
          activeNodes.forEach((node) => {
            node.removeAttribute("data-processed");
            node.removeAttribute("id");
          });

          await mermaid.run({
            nodes: activeNodes,
          });
        } catch (mermaidError) {
          console.debug("Mermaid handled typing frame transition smoothly.");
        }
      }
    } catch (err) {
      console.error("Preview render error:", err);
      this.container.innerHTML = `<div class="p-4 text-danger text-sm">
        <p>Error rendering markdown. Check the console for details.</p>
      </div>`;
    }
  }

  clear() {
    this._markdown = "";
    this.container.innerHTML = "";
  }
}
