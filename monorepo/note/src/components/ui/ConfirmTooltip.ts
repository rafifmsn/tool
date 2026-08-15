/**
 * ConfirmTooltip — inline confirmation shown on hover.
 * Shows "Delete? Yes · Cancel" with slide-up animation.
 */

export interface ConfirmTooltipOptions {
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export class ConfirmTooltip {
  private el: HTMLElement;
  private options: Required<
    Omit<ConfirmTooltipOptions, "onConfirm" | "onCancel">
  > &
    Pick<ConfirmTooltipOptions, "onConfirm" | "onCancel">;
  private tooltipEl: HTMLElement | null = null;

  constructor(anchor: HTMLElement, options: ConfirmTooltipOptions) {
    this.el = anchor;
    this.options = {
      message: "Delete?",
      confirmLabel: "Yes",
      cancelLabel: "Cancel",
      ...options,
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    if (this.tooltipEl) return;

    this.tooltipEl = document.createElement("div");
    this.tooltipEl.className =
      "slide-up absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg";
    this.tooltipEl.setAttribute("role", "tooltip");

    const msg = document.createElement("span");
    msg.className = "text-[var(--color-text-secondary)]";
    msg.textContent = this.options.message;

    const confirmBtn = document.createElement("button");
    confirmBtn.className =
      "rounded px-1.5 py-0.5 font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors";
    confirmBtn.textContent = this.options.confirmLabel;
    confirmBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.options.onConfirm();
      this.hide();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className =
      "rounded px-1.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors";
    cancelBtn.textContent = this.options.cancelLabel;
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.options.onCancel();
      this.hide();
    });

    this.tooltipEl.appendChild(msg);
    this.tooltipEl.appendChild(confirmBtn);
    this.tooltipEl.appendChild(cancelBtn);

    const anchorParent = this.el.parentElement;
    if (anchorParent) {
      const pos = getComputedStyle(anchorParent).position;
      if (pos === "static") {
        anchorParent.style.position = "relative";
      }
    }

    this.el.appendChild(this.tooltipEl);
  }

  hide() {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }

  isVisible(): boolean {
    return this.tooltipEl !== null;
  }
}
