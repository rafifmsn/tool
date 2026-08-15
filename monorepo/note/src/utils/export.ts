import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { TextFile, AttachedAsset } from "../services/db";

export function downloadAsMarkdown(file: TextFile): void {
  const blob = new Blob([file.content], {
    type: "text/markdown;charset=utf-8",
  });
  saveAs(blob, file.name);
}

/**
 * Ironclad Pure-String Export Pipeline
 * Temporarily overrides the primary document title context to force Chrome
 * to adopt the active note filename as the default PDF save header name.
 */
export async function downloadAsPDF(
  fileOrElement: any,
  filename?: string,
): Promise<void> {
  let rawMarkdown = "";
  let fallbackHTML = "";
  let targetName = "document.pdf"; // Default fallback if context is missing

  // 1. EXTRACT DATA AND TRACK TARGET FILENAME
  if (
    fileOrElement &&
    typeof fileOrElement === "object" &&
    "content" in fileOrElement
  ) {
    rawMarkdown = fileOrElement.content || "";
    if (fileOrElement.name) targetName = fileOrElement.name;
  } else if (filename) {
    targetName = filename;
  }

  if (fileOrElement instanceof HTMLElement) {
    fallbackHTML = fileOrElement.innerHTML;
    rawMarkdown = (window as any).currentMarkdownBuffer || "";
  }

  // Clean trailing extensions to provide a neat filename header
  const cleanName = targetName.replace(/\.md$/i, "");

  // 2. PARSE HTML ENGINE WITH GROUND-UP ERROR FALLBACKS
  let printHTML = "";
  try {
    if (rawMarkdown.trim()) {
      const { renderMarkdown } = await import("./markdown.ts");
      printHTML = await renderMarkdown(rawMarkdown);
    } else {
      printHTML = fallbackHTML;
    }
  } catch (err) {
    console.warn(
      "Print Engine compiler fallback: Using standard HTML clone structure due to parsing context restrictions.",
      err,
    );
    printHTML = fallbackHTML || fileOrElement?.innerHTML || "";
  }

  if (!printHTML.trim()) {
    alert("Cannot export an empty document.");
    return;
  }

  // 3. GENERATE SELF-CONTAINED MOUNTED PRINT CANVAS IFRAME
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "1024px";
  iframe.style.height = "768px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    console.error(
      "Critical Failure: Isolated iframe context could not be instantiated.",
    );
    return;
  }

  // 4. WRITE EXPLICIT DOCUMENT AND LIGHT-MODE LAYOUT OVERRIDES
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${cleanName}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <style>
        @media print {
          html, body {
            background: #ffffff !important;
            color: #111827 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 20mm;
          }
        }

        body {
          background: #ffffff !important;
          color: #111827 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 11pt;
          line-height: 1.6;
          padding: 10px;
        }

        h1, h2, h3, h4, h5, h6 {
          color: #000000 !important;
          font-weight: 700 !important;
          margin-top: 22px !important;
          margin-bottom: 12px !important;
          page-break-after: avoid;
          break-after: avoid;
        }
        h1 { font-size: 24pt !important; margin-top: 0 !important; }
        h2 { font-size: 18pt !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 6px !important; }
        h3 { font-size: 14pt !important; }

        p { margin: 0 0 14px 0 !important; color: #1f2937 !important; }

        hr { border: 0 !important; border-top: 1.5px solid #e5e7eb !important; margin: 28px 0 !important; }

        blockquote {
          border-left: 4px solid #d1d5db !important;
          padding-left: 16px !important;
          color: #4b5563 !important;
          font-style: italic !important;
          margin: 18px 0 !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* ── 📊 AUTO-BREAKING DATA TABLES ── */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 24px 0 !important;
          table-layout: auto !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        thead { display: table-header-group !important; }
        tr { page-break-inside: avoid !important; break-inside: avoid !important; }
        th, td {
          border: 1px solid #e5e7eb !important;
          padding: 10px 12px !important;
          font-size: 10pt !important;
          text-align: left !important;
          vertical-align: top !important;
          word-break: normal !important;
          white-space: normal !important;
        }
        th {
          background-color: #f9fafb !important;
          color: #111827 !important;
          font-weight: 600 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ── LaTeX MATH SHAPE OVERRIDES ── */
        .katex-display {
          width: 100% !important;
          margin: 18px 0 !important;
          padding: 4px 0 !important;
          text-align: center !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .katex {
          color: #000000 !important;
        }

        /* Inline code adjustments */
        .print-root code,
        body code {
          font-family: "JetBrains Mono", "Fira Code", monospace !important;
          font-size: 9.5pt !important;
          background: #f4f4f5 !important;
          padding: 2px 4px !important;
          border-radius: 4px !important;
          color: #000000 !important;
          display: inline !important;
          white-space: normal !important;
          word-break: normal !important;
        }

        pre {
          background: #f3f4f6 !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 14px 16px !important;
          margin: 20px 0 !important;
          white-space: pre-wrap !important;
          word-break: break-all !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        pre code { color: #111827 !important; display: block !important; white-space: pre-wrap !important; }
        pre span { color: inherit !important; background: none !important; }

        /* ── 📋 UNBROKEN UNIFIED TEXT STREAM LIST LAYOUTS ── */
        ul, ol { margin: 0 0 14px 0 !important; padding-left: 24px !important; }
        li { margin-bottom: 6px !important; color: #1f2937 !important; }
        
        li.task-list-item, li:has(input[type="checkbox"]) {
          list-style-type: none !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          display: block !important; 
          text-indent: -20px !important; 
          padding-left: 20px !important;
        }

        /* Progressive Indentation Rules for Nested Sub-lists */
        .clean-pdf-list-container .clean-pdf-list-container,
        ul ul, ul ol, ol ul, ol ol,
        li.task-list-item > div,
        li:has(input[type="checkbox"]) > div {
          padding-left: 20px !important;
          margin-top: 6px !important;
          text-indent: 0 !important; 
        }

        li.task-list-item > p, 
        li:has(input[type="checkbox"]) > p,
        li.task-list-item > span,
        li:has(input[type="checkbox"]) > span {
          margin: 0 !important;
          padding: 0 !important;
          display: inline !important; 
          line-height: 1.6 !important;
        }

        input[type="checkbox"] {
          display: inline-block !important;
          vertical-align: middle !important;
          position: relative !important;
          top: -1px !important; 
          margin: 0 8px 0 0 !important;
          text-indent: 0 !important; 
          
          width: 13px !important;
          height: 13px !important;
          transform: scale(1.05) !important;
          accent-color: #111827 !important;
        }

        svg, .mermaid {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 24px auto !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .mermaid-block, .mermaid svg, .mermaid g { background: none !important; background-color: transparent !important; }
        .mermaid text, .mermaid span, .mermaid label, .mermaid .edgeLabel, .mermaid .labelText {
          color: #000000 !important;
          fill: #000000 !important;
          font-weight: 500 !important;
        }
        .mermaid rect, .mermaid circle, .mermaid polygon, .mermaid path, .mermaid .node, .mermaid .cluster rect {
          fill: #f9fafb !important;
          stroke: #1f2937 !important;
          stroke-width: 1.5px !important;
        }
        .mermaid .edgePaths path, .mermaid .flowchart-link { stroke: #4b5563 !important; fill: none !important; }
      </style>
    </head>
    <body>
      ${printHTML}
    </body>
    </html>
  `);
  doc.close();

  // 5. RUN SYSTEM PRINTER WITH TEMPORARY PARENT TITLE SWAP
  setTimeout(() => {
    // Save the genuine master page title before making any adjustments
    const originalPageTitle = document.title;
    try {
      if (iframe.contentWindow) {
        document.title = cleanName;

        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    } catch (printError) {
      console.error(
        "Direct frame execution block encountered a core failure:",
        printError,
      );
    } finally {
      document.title = originalPageTitle;

      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }
  }, 350);
}

export async function exportAllAsZip(
  files: TextFile[],
  assets: AttachedAsset[],
): Promise<void> {
  const zip = new JSZip();
  const documentsFolder = zip.folder("documents");
  const attachmentsFolder = zip.folder("attachments");

  for (const file of files) {
    documentsFolder?.file(file.name, file.content);
  }
  for (const asset of assets) {
    attachmentsFolder?.file(asset.name, asset.data);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "editor-workspace-export.zip");
}

export async function exportTabAsZip(
  files: TextFile[],
  assets: AttachedAsset[],
  tabName: string,
): Promise<void> {
  const zip = new JSZip();
  const safeName = tabName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const documentsFolder = zip.folder(`${safeName}/documents`);
  const attachmentsFolder = zip.folder(`${safeName}/attachments`);

  for (const file of files) {
    documentsFolder?.file(file.name, file.content);
  }
  for (const asset of assets) {
    attachmentsFolder?.file(asset.name, asset.data);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${safeName}-export.zip`);
}
