/**
 * KanbanCard — draggable card with inline title/description editing.
 * Uses native HTML5 Drag & Drop API + touch events for mobile.
 */

import type { KanbanCard } from "../../services/db";

interface CardCallbacks {
  onDelete: (id: string) => void;
  onEdit: (card: KanbanCard) => void;
}

export class KanbanCardComponent {
  private card: KanbanCard;
  private callbacks: CardCallbacks;
  private expanded = false;

  constructor(card: KanbanCard, callbacks: CardCallbacks) {
    this.card = card;
    this.callbacks = callbacks;
  }

  render(): HTMLElement {
    const el = document.createElement("div");
    el.className =
      "group relative rounded-md border border-border bg-card px-3 py-2.5 hover:border-outline transition-all duration-200 overflow-hidden touch-none select-none";
    el.dataset.cardId = this.card.id;
    el.draggable = true;

    // ── Drag events (mouse) ──
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", this.card.id);
      el.classList.add("opacity-40", "border-outline");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("opacity-40", "border-outline");
    });

    // ── Touch drag (mobile) ──
    let touchStarted = false;

    el.addEventListener(
      "touchstart",
      (e) => {
        if (this.expanded) return;

        // Dim the source card slightly to show active selection feedback
        el.style.opacity = "0.4";
        touchStarted = true;
      },
      { passive: true },
    );

    el.addEventListener(
      "touchmove",
      (e) => {
        if (!touchStarted) return;
        const touch = e.touches[0]!;

        // ── AUTO-SCROLL LOGIC FOR MOBILE BOUNDS ──
        const scrollThreshold = 70; // Pixels from screen edge to trigger auto-scroll
        const scrollSpeed = 8; // Speed multiplier
        const windowHeight = window.innerHeight;

        // Target the parent scroll container
        const scrollContainer =
          document.getElementById("main-panel") || document.documentElement;

        if (touch.clientY > windowHeight - scrollThreshold) {
          // Near bottom: Nudge window downwards
          scrollContainer.scrollTop += scrollSpeed;
        } else if (touch.clientY < scrollThreshold) {
          // Near top: Nudge window upwards
          scrollContainer.scrollTop -= scrollSpeed;
        }

        // Highlight drop target (your existing coordinate lookup loop)
        document.querySelectorAll("[data-column]").forEach((col) => {
          const rect = col.getBoundingClientRect();
          const inBounds =
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom;
          col.classList.toggle("bg-muted", inBounds);
        });
      },
      { passive: true },
    );

    el.addEventListener(
      "touchend",
      async (e) => {
        if (!touchStarted) return;
        touchStarted = false;
        el.style.opacity = "1"; // Restore full visibility state

        const touch = e.changedTouches[0]!;
        const columns = document.querySelectorAll("[data-column]");

        for (const col of columns) {
          col.classList.remove("bg-muted");
          const rect = col.getBoundingClientRect();
          const inBounds =
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom;

          if (inBounds) {
            const colId = col.getAttribute("data-column") as
              | "todo"
              | "inprogress"
              | "done"
              | null;

            if (colId && colId !== this.card.column) {
              const { updateKanbanCardColumn, getNextKanbanOrder } =
                await import("../../services/db.ts");
              const order = (await getNextKanbanOrder(colId)) + 1;
              await updateKanbanCardColumn(this.card.id, colId, order);

              // Fire state update dispatch
              document.dispatchEvent(new CustomEvent("kanban-reload"));
            }
            break;
          }
        }
      },
      { passive: true },
    );

    // ── Title ──
    const titleEl = document.createElement("div");
    titleEl.className = "text-sm font-medium text-foreground";
    titleEl.textContent = this.card.title || "Untitled";
    titleEl.dataset.cardText = "true";
    el.appendChild(titleEl);

    // ── Description ──
    if (this.card.description) {
      const descEl = document.createElement("div");
      descEl.className =
        "text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap";
      descEl.textContent = this.card.description;
      descEl.dataset.cardText = "true";
      el.appendChild(descEl);
    }

    // ── Click to expand for editing ──
    el.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("button, input, textarea")) return;
      if (!this.expanded) this.expand(el);
    });

    return el;
  }

  private expand(el: HTMLElement) {
    this.expanded = true;
    el.draggable = false;

    // 1. Capture the initial height before changing anything
    const startHeight = el.offsetHeight;
    el.style.height = `${startHeight}px`;

    // 2. Add a quick fade-out look while swapping elements
    el.classList.add("opacity-50");

    setTimeout(() => {
      // Clean out old text nodes
      const existingText = el.querySelectorAll("[data-card-text]");
      existingText.forEach((n) => n.remove());

      const editContainer = document.createElement("div");
      editContainer.className =
        "space-y-2 opacity-0 transition-opacity duration-150"; // Start hidden

      // Title input
      const titleInput = document.createElement("input");
      titleInput.className =
        "w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-outline";
      titleInput.value = this.card.title;
      titleInput.placeholder = "Card title";

      // Description textarea — resizable vertically with max-height
      const descInput = document.createElement("textarea");
      descInput.className =
        "w-full min-h-[60px] rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground outline-none focus:border-outline resize-y";
      descInput.style.maxHeight = "160px";
      descInput.value = this.card.description || "";
      descInput.placeholder = "Description (optional)";
      descInput.rows = 2;

      titleInput.addEventListener("mousedown", (e) => e.stopPropagation());
      titleInput.addEventListener("click", (e) => e.stopPropagation());
      descInput.addEventListener("mousedown", (e) => e.stopPropagation());
      descInput.addEventListener("click", (e) => e.stopPropagation());

      // Buttons
      const btnRow = document.createElement("div");
      btnRow.className = "flex items-center gap-2";

      const deleteBtn = document.createElement("button");
      const trashIcon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      deleteBtn.className =
        "rounded px-2 py-1 text-xs text-error hover:bg-error/10 transition-colors flex items-center gap-1 cursor-pointer";
      deleteBtn.innerHTML = trashIcon + '<span> Delete</span>';
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.callbacks.onDelete(this.card.id);
      });

      const spacer = document.createElement("div");
      spacer.className = "flex-1";

      const cancelBtn = document.createElement("button");
      cancelBtn.className =
        "rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.collapse(el);
      });

      const saveBtn = document.createElement("button");
      saveBtn.className =
        "rounded bg-foreground text-background px-2.5 py-1 text-xs font-medium hover:bg-foreground/90 transition-colors cursor-pointer";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.card.title = titleInput.value.trim() || "Untitled";
        this.card.description = descInput.value.trim() || "";
        this.callbacks.onEdit({ ...this.card });
        this.collapse(el);
      });

      btnRow.appendChild(deleteBtn);
      btnRow.appendChild(spacer);
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(saveBtn);

      editContainer.appendChild(titleInput);
      editContainer.appendChild(descInput);
      editContainer.appendChild(btnRow);
      el.appendChild(editContainer);

      // 3. Measure the natural height of the new content layout
      const targetHeight = el.scrollHeight;

      // Animate height and restore opacity safely
      el.style.height = `${targetHeight}px`;
      el.classList.remove("opacity-50");

      // Fade the inner controls in smoothly right after height settles
      setTimeout(() => {
        editContainer.classList.remove("opacity-0");
        // Reset height to auto so card can still adapt if user types long lines
        el.style.height = "auto";
      }, 200);

      // Focus title instantly for a snappy feel
      titleInput.focus();
    }, 50);
  }

  private collapse(el: HTMLElement) {
    this.expanded = false;
    el.draggable = true;

    // 1. Lock current expanded height
    const startHeight = el.offsetHeight;
    el.style.height = `${startHeight}px`;

    // 2. Render a clean fallback version off-screen to measure its height
    const freshCard = this.render();
    freshCard.style.visibility = "hidden";
    freshCard.style.position = "absolute";
    document.body.appendChild(freshCard);
    const targetHeight = freshCard.offsetHeight;
    freshCard.remove();

    // 3. Fade out the inputs, animate height down, then swap elements out
    el.classList.add("opacity-30");
    el.style.height = `${targetHeight}px`;

    setTimeout(() => {
      el.innerHTML = "";
      // Re-render layout parameters cleanly
      const fresh = this.render();
      el.replaceWith(fresh);
    }, 200);
  }
}
