// Maintain the loading state and a reference to the initialized mermaid instance
let mermaidInstance: any = null;

export async function renderMermaid(
  definition: string,
  id: string,
): Promise<string> {
  if (!mermaidInstance) {
    const mermaidModule = await import("mermaid");
    // Handle ESM default export variations
    const mermaid = mermaidModule.default ?? mermaidModule;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        background: "transparent",
        primaryColor: "#27272a",
        primaryTextColor: "#fafafa",
        primaryBorderColor: "#202124",
        lineColor: "#52525b",
        secondaryColor: "#18181b",
        tertiaryColor: "#111113",
      },
    });

    mermaidInstance = mermaid;
  }

  // Use the stored instance instead of the blocked module variable
  const { svg } = await mermaidInstance.render(id, definition);
  return svg;
}

/**
 * Find all mermaid code blocks in rendered HTML and replace them with SVGs.
 * This is called after the unified pipeline has produced HTML.
 */
export async function processMermaidBlocks(html: string): Promise<string> {
  const mermaidRegex =
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

  // Using matchAll avoids issues with manual regex execution states
  const matches = [...html.matchAll(mermaidRegex)];
  let result = html;
  let counter = 0;

  for (const match of matches) {
    const originalBlock = match[0];
    const definition = match[1]?.trim();

    if (!definition) continue;

    try {
      const svg = await renderMermaid(definition, `mermaid-${counter++}`);
      result = result.replace(originalBlock, svg);
    } catch (error) {
      // Log it or leave the original block intact if it fails
      console.error("Failed to render Mermaid block:", error);
      continue;
    }
  }

  return result;
}
