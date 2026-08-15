# Architectural Decisions

This document details the architectural guidelines, core patterns, and engineering decisions implemented throughout the project.

## Zero-Bloat CDN Loader Pattern
To maintain a small production footprint (under a strict 25MB `/dist` output constraint), the static site imports zero heavy libraries directly during compile time.
* **On-Demand Loading**: Heavy engines such as KaTeX (math previewing), MathJax (math vector compiling), jsQR (camera decoding), and Diff-match-patch (text diff comparisons) are dynamically injected in the browser via asynchronous script tags only when a user visits that tool's specific page.
* **Multi-Layer Fallbacks**: Dynamic loaders utilize CDN failover arrays (e.g., cdnjs -> jsDelivr -> unpkg) to ensure page reliability even if a primary host experiences downtime.
* **Global Overhead Avoidance**: The base page weight remains under 500 KB, keeping load times sub-millisecond on initial visit.

## Self-Contained Vector Math Compilation
Capturing rendered mathematical formulas to canvas elements historically suffers from canvas tainting security rules and font/typesetting layout displacement.
* **Local Font Caching**: MathJax is configured with `fontCache: 'local'` before script initialization. This forces MathJax to embed the character path definitions (`<defs>`) directly inside the generated `<svg>` tag, creating a self-contained vector drawing.
* **Taint-Free Canvas Drawing**: Since the output SVG is composed entirely of local vector paths with no external web font references or HTML `<foreignObject>` tags, drawing the vector image to a canvas does not taint it. Exporting the canvas using `toDataURL` works on all browsers without triggering a `SecurityError`.
* **Ex-Unit Pixel Resolution**: MathJax SVG outputs default to relative font units (`ex`) for sizing. Because `ex` font heights collapse to `0px` when loaded outside the document's typography context, we programmatically measure the formula's pixel dimensions via `getBoundingClientRect` and override the SVG's attributes with absolute pixel values.

## Symmetric Sessional State Systems
The interface styling controls prioritize high usability and code predictability over complex configurations.
* **Automatic Wrapper Inference**: Rather than requiring the user to choose an equation wrapper dropdown, the tool dynamically detects standard delimiters (`$$`, `$`, `\[`, `\(`) directly from the input text, stripping them for KaTeX rendering while preserving block vs inline display modes automatically.
* **Simplified Theme Toggles**: Complex hex code picker inputs are replaced by binary custom properties (Invert Color for dark mode, and Transparent Background). Invert values switch dynamically between predefined light (`#010100` on `#ffffff`) and dark (`#fafafa` on `#09090b`) color palettes, ensuring contrast accessibility.
* **CSS Path Inheritance**: All vector path fills and strokes inside Math previews are forced to inherit colors via `fill: currentColor !important; stroke: currentColor !important;`. This ensures color adjustments propagate to formulas instantly.

## Symmetrical Dynamic Layouts
UI workflows are designed to scale cleanly based on content state.
* **Initial Balanced States**: Tools like Paste to Image display a centered, minimal upload card on mount. Symmetrical grids are avoided until content is loaded to prevent empty placeholder columns or unaligned elements.
* **State Transitions**: Once content is loaded, the DOM transitions to split layouts (such as 2/3 preview and 1/3 setting columns) using flexible utility visibility classes rather than structural grid containers, preserving alignment fluidly.

## File & Logic Isolation
To keep the codebase modular, predictable, and manageable as new tools are introduced, the project enforces a strict boundary between routing/templates and business logic:
* **Page Routes**: Each tool has its entrypoint defined as a single template page in `src/pages/<slug>.astro` to handle layout binding.
* **Logic Isolation**: Any associated JS/TS controllers, dynamic script loaders, formatting utilities, CSS configs, or data handlers are segregated into dedicated directories inside `src/utils/<slug>/`. This shields other utilities from cross-contamination.

