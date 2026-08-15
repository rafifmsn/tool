import { describe, test, expect } from "vitest";
import katex from "katex";

// Helper to strip wrappers and delimiters for evaluation
function cleanFormula(input: string): string {
  let formula = input.trim();

  if (formula.startsWith("$$") && formula.endsWith("$$")) {
    formula = formula.substring(2, formula.length - 2).trim();
  } else if (formula.startsWith("\\[") && formula.endsWith("\\]")) {
    formula = formula.substring(2, formula.length - 2).trim();
  } else if (formula.startsWith("\\(") && formula.endsWith("\\)")) {
    formula = formula.substring(2, formula.length - 2).trim();
  } else if (formula.startsWith("$") && formula.endsWith("$")) {
    formula = formula.substring(1, formula.length - 1).trim();
  }

  // Handle multi-line spacing auto-wrapping
  if (formula.includes("\\\\") && !formula.includes("\\begin{")) {
    formula = `\\begin{gathered}${formula}\\end{gathered}`;
  }

  return formula;
}

describe("LaTeX Render & Parser Suite", () => {
  test("should successfully parse standard mathematical formula syntax", () => {
    const raw = "I^2 = \\int_{0}^{\\frac{\\pi}{2}} d\\theta";
    const cleaned = cleanFormula(raw);
    const html = katex.renderToString(cleaned, { throwOnError: true });
    
    expect(html).toContain("katex-html");
    expect(html).toContain("int");
  });

  test("should auto-detect and strip standard block delimiters ($$ ... $$)", () => {
    const raw = "$$I^2 = \\frac{\\pi}{2}$$";
    const cleaned = cleanFormula(raw);
    
    expect(cleaned).toBe("I^2 = \\frac{\\pi}{2}");
    const html = katex.renderToString(cleaned, { throwOnError: true });
    expect(html).toContain("katex");
  });

  test("should auto-detect and strip standard bracket delimiters (\\[ ... \\])", () => {
    const raw = "\\[I^2 = \\frac{\\pi}{2}\\]";
    const cleaned = cleanFormula(raw);
    
    expect(cleaned).toBe("I^2 = \\frac{\\pi}{2}");
    const html = katex.renderToString(cleaned, { throwOnError: true });
    expect(html).toContain("katex");
  });

  test("should auto-wrap multi-line equations (\\\\) in gathered environment", () => {
    const raw = "a = b \\\\ c = d";
    const cleaned = cleanFormula(raw);
    
    expect(cleaned).toBe("\\begin{gathered}a = b \\\\ c = d\\end{gathered}");
    const html = katex.renderToString(cleaned, { throwOnError: true });
    expect(html).toContain("gathered");
  });

  test("should throw parser error on invalid LaTeX exponents or symbols", () => {
    // Missing matching brace for fraction group is a parse error
    expect(() => {
      katex.renderToString("\\frac{", { throwOnError: true });
    }).toThrowError(/KaTeX parse error/);
  });
});
