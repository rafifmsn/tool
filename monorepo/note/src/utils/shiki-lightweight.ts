import type { Plugin } from "unified";
import type { Root, Element, RootContent } from "hast";

const DEFAULT_THEME = "github-dark";

interface ShikiOptions {
  theme?: string;
}

/**
 * A rehype plugin that applies basic syntax highlighting to
 * <pre><code> elements using Shiki v4+.
 */
export const rehypeShiki: Plugin<[ShikiOptions?], Root> = function (
  options = {},
) {
  const theme = options.theme ?? DEFAULT_THEME;

  return async (tree: Root) => {
    // Only import createHighlighter; getHighlighter doesn't exist in v4 core module
    const { createHighlighter } = await import("shiki");

    const highlighter = await createHighlighter({
      themes: [theme],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "html",
        "css",
        "json",
        "bash",
        "shell",
        "python",
        "rust",
        "go",
        "java",
        "yaml",
        "markdown",
        "sql",
        "graphql",
        "diff",
        "docker",
        "ruby",
        "php",
        "c",
        "cpp",
      ],
    });

    // Helper to traverse the HAST tree safely
    function visit(
      node: any,
      cb: (node: any, parent: any, index: number) => void,
      parent: any = null,
      index = 0,
    ) {
      if (node && typeof node === "object") {
        cb(node, parent, index);
        if (node.children && Array.isArray(node.children)) {
          // Shallow copy to prevent issues if children are mutated/replaced during iteration
          const children = [...node.children];
          for (let i = 0; i < children.length; i++) {
            visit(children[i], cb, node, i);
          }
        }
      }
    }

    visit(tree, (node: any, parent: any, index: number) => {
      // Shiki outputs a <pre> wrapping a <code>.
      // We look for <pre> containing our target <code> element to replace it accurately.
      if (node.tagName === "pre" && node.children && node.children.length > 0) {
        const codeNode = node.children[0];

        if (
          codeNode &&
          codeNode.tagName === "code" &&
          codeNode.properties?.className &&
          Array.isArray(codeNode.properties.className)
        ) {
          const langClass = codeNode.properties.className.find((c: string) =>
            c.startsWith("language-"),
          );

          if (langClass) {
            const lang = langClass.replace("language-", "");
            const code = extractText(codeNode);

            if (code && lang) {
              try {
                // Let Shiki generate HAST directly instead of raw HTML string stringifying/parsing
                const hast = highlighter.codeToHast(code, { lang, theme });

                // Find the new <pre> element from Shiki's tree output
                const highlightedPre = hast.children.find(
                  (child) =>
                    child.type === "element" && child.tagName === "pre",
                ) as Element | undefined;

                if (highlightedPre && parent) {
                  // Safely swap old pre node with Shiki's syntax-highlighted HAST node
                  parent.children[index] = highlightedPre;
                }
              } catch (error) {
                // Fallback: keep original markup unchanged if rendering fails
                console.error(
                  `Shiki failed highlighting for language: ${lang}`,
                  error,
                );
              }
            }
          }
        }
      }
    });
  };
};

function extractText(node: any): string {
  if (!node.children) return "";
  return node.children
    .map((child: any) => {
      if (child.type === "text") return child.value;
      if (child.children) return extractText(child);
      return "";
    })
    .join("");
}
