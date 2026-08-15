/**
 * LightboxModal — image lightbox with dark overlay.
 */

export class LightboxModal {
  private overlay: HTMLElement;
  private onClose: () => void;

  constructor(imageUrl: string, onClose: () => void) {
    this.onClose = onClose;

    this.overlay = document.createElement("div");
    this.overlay.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/80 fade-in";
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Escape key
    this.overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });

    const img = document.createElement("img");
    img.className =
      "animate-in max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain";
    img.src = imageUrl;
    img.alt = "Preview";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className =
      "absolute top-4 right-4 icon-btn bg-[var(--color-surface-overlay)] w-8 h-8 rounded-full";
    closeBtn.innerHTML = '<span class="text-sm leading-none">✕</span>';
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", () => this.close());

    this.overlay.appendChild(img);
    this.overlay.appendChild(closeBtn);
    document.body.appendChild(this.overlay);
    this.overlay.focus();
  }

  close() {
    this.overlay.remove();
    this.onClose();
  }
}
