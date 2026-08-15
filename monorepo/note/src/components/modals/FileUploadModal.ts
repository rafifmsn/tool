/**
 * FileUploadModal — drag-and-drop zone with file type validation.
 */

import {
  saveAsset,
  saveFile,
  generateId,
  getAllFiles,
  getAllAssets,
} from "../../services/db";

const ACCEPTED_TYPES = [
  "text/markdown",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const ACCEPTED_EXTENSIONS = [
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
];

export class FileUploadModal {
  private overlay: HTMLElement;
  private modal: HTMLElement;
  private onClose: () => void;

  constructor(onClose: () => void) {
    this.onClose = onClose;

    // Overlay
    this.overlay = document.createElement("div");
    this.overlay.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/60 fade-in";
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Escape key
    this.overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });

    // Modal
    this.modal = document.createElement("div");
    this.modal.className =
      "animate-in relative w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-xl";
    this.modal.setAttribute("role", "dialog");
    this.modal.setAttribute("aria-label", "Upload files");

    this.modal.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-foreground">Upload Files</h2>
        <button class="icon-btn" aria-label="Close" data-close>
          <span class="text-sm leading-none">✕</span>
        </button>
      </div>
      <div
        class="drop-zone relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-8 transition-colors cursor-pointer"
        role="button"
        tabindex="0"
        aria-label="Drop files here or click to browse"
      >
        <div class="text-2xl mb-2 opacity-40">📁</div>
        <p class="text-sm text-muted-foreground mb-1">Drop files here</p>
        <p class="text-xs text-muted-foreground">or click to browse</p>
        <input type="file" multiple accept="${ACCEPTED_EXTENSIONS.join(",")}" class="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
      <div class="mt-3 text-xs text-muted-foreground">
        Accepted: .md, .png, .jpg, .gif, .webp, .pdf
      </div>
      <div class="error-container mt-2 hidden"></div>
    `;

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
    this.overlay.focus();

    this.setupEvents();
  }

  private setupEvents() {
    const closeBtn = this.modal.querySelector("[data-close]");
    closeBtn?.addEventListener("click", () => this.close());

    const fileInput = this.modal.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const dropZone = this.modal.querySelector(".drop-zone") as HTMLElement;

    fileInput?.addEventListener("change", () => {
      if (fileInput.files) {
        this.processFiles(Array.from(fileInput.files));
      }
    });

    // Drag events
    dropZone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add(
        "border-outline",
        "bg-muted",
      );
    });

    dropZone?.addEventListener("dragleave", () => {
      dropZone.classList.remove(
        "border-outline",
        "bg-muted",
      );
    });

    dropZone?.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove(
        "border-outline",
        "bg-muted",
      );
      if (e.dataTransfer?.files) {
        this.processFiles(Array.from(e.dataTransfer.files));
      }
    });
  }

  private async processFiles(files: File[]) {
    const errors: string[] = [];
    let processed = 0;

    const activeTabId = (window as any).__activeTabId || "";

    for (const file of files) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        errors.push(`"${file.name}" — unsupported file type`);
        continue;
      }

      const id = generateId();
      const mimeType = file.type || "application/octet-stream";

      if (ext === ".md") {
        const content = await file.text();
        await saveFile({
          id,
          name: file.name,
          content,
          type: "markdown",
          tabId: activeTabId,
          updatedAt: Date.now(),
        });
      } else if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
        await saveAsset({
          id,
          name: file.name,
          data: file,
          type: "image",
          tabId: activeTabId,
          mimeType,
          size: file.size,
          updatedAt: Date.now(),
        });
      } else if (ext === ".pdf") {
        await saveAsset({
          id,
          name: file.name,
          data: file,
          type: "pdf",
          tabId: activeTabId,
          mimeType: "application/pdf",
          size: file.size,
          updatedAt: Date.now(),
        });
      }
      processed++;
    }

    // Show errors
    const errorContainer = this.modal.querySelector(
      ".error-container",
    ) as HTMLElement;
    if (errors.length > 0) {
      errorContainer.classList.remove("hidden");
      errorContainer.innerHTML = errors
        .map((e) => `<div class="text-xs text-danger py-0.5">${e}</div>`)
        .join("");
    } else {
      errorContainer.classList.add("hidden");
    }

    if (processed > 0) {
      document.dispatchEvent(new CustomEvent("file-list-changed"));
      this.close();
    }
  }

  close() {
    this.overlay.remove();
    this.onClose();
  }
}
