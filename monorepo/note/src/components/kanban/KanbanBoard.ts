/**
 * KanbanBoard — column layout with native HTML5 drag-and-drop.
 */

import type { KanbanCard, ColumnId } from "../../services/db";
import { COLUMN_LABELS } from "../../services/db";
import {
  getKanbanCards,
  saveKanbanCard,
  deleteKanbanCard,
  updateKanbanCardColumn,
  getNextKanbanOrder,
  generateId,
} from "../../services/db";
import { KanbanColumn } from "../../utils/kanban-column";
import { KanbanCardComponent } from "./KanbanCard";

export class KanbanBoard {
  private container: HTMLElement;
  private columns: KanbanColumn[] = [];
  private cards: KanbanCard[] = [];
  private draggedCardId: string | null = null;
  private _activeTabId: string = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.className =
      "grid grid-cols-1 lg:grid-cols-3 gap-4 mx-auto w-full lg:max-w-6xl h-full p-4 lg:p-6 overflow-y-auto lg:overflow-y-hidden";
    this.render = this.render.bind(this);
    this.loadCards();

    document.addEventListener("kanban-reload", () => this.loadCards());
  }

  private getActiveTabId(): string {
    return (window as any).__activeTabId || "";
  }

  async loadCards() {
    this._activeTabId = this.getActiveTabId();
    this.cards = await getKanbanCards(this._activeTabId || undefined);
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    this.columns = [];

    const columnIds: ColumnId[] = ["todo", "inprogress", "done"];

    for (const colId of columnIds) {
      const colCards = this.cards
        .filter((c) => c.column === colId)
        .sort((a, b) => a.order - b.order);

      const colEl = document.createElement("div");
      colEl.className =
        "flex flex-col w-full rounded-lg border border-border bg-card shadow-sm max-h-[85vh] lg:max-h-none";
 
      // Header
      const header = document.createElement("div");
      header.className =
        "flex items-center justify-between px-3 py-2.5 border-b border-border";
      header.innerHTML = `
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-secondary">
          ${COLUMN_LABELS[colId]}
        </span>
        <span class="text-xs text-muted-foreground">${colCards.length}</span>
      `;
      colEl.appendChild(header);
 
      // Cards container (droppable)
      const cardsContainer = document.createElement("div");
      cardsContainer.className =
        "flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]";
      cardsContainer.dataset.column = colId;
 
      // Drop zone events
      cardsContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        cardsContainer.classList.add(
          "bg-muted",
          "border-outline",
        );
      });
 
      cardsContainer.addEventListener("dragleave", () => {
        cardsContainer.classList.remove(
          "bg-muted",
          "border-outline",
        );
      });
 
      cardsContainer.addEventListener("drop", async (e) => {
        e.preventDefault();
        cardsContainer.classList.remove(
          "bg-muted",
          "border-outline",
        );
        const cardId = e.dataTransfer?.getData("text/plain");
        if (!cardId) return;
        const order = await getNextKanbanOrder(colId);
        await updateKanbanCardColumn(cardId, colId, order);
        this.loadCards();
      });
 
      // Render cards
      for (const card of colCards) {
        const cardComp = new KanbanCardComponent(card, {
          onDelete: async (id) => {
            await deleteKanbanCard(id);
            this.loadCards();
          },
          onEdit: async (updated) => {
            await saveKanbanCard(updated);
            this.loadCards();
          },
        });
        cardsContainer.appendChild(cardComp.render());
      }
 
      colEl.appendChild(cardsContainer);
 
      // Add card button
      const addBtn = document.createElement("button");
      addBtn.className =
        "flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-t border-border";
      addBtn.innerHTML = '<span class="text-sm leading-none">+</span> Add Card';
      addBtn.addEventListener("click", () => this.addCard(colId));
      colEl.appendChild(addBtn);

      this.container.appendChild(colEl);
      this.columns.push(new KanbanColumn(colEl, colId));
    }
  }

  private async addCard(column: ColumnId) {
    const order = await getNextKanbanOrder(
      column,
      this._activeTabId || undefined,
    );
    const card: KanbanCard = {
      id: generateId(),
      title: "New Card",
      description: "",
      column,
      order,
      tabId: this._activeTabId || "",
      createdAt: Date.now(),
    };
    await saveKanbanCard(card);
    this.loadCards();
  }
}
