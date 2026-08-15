/**
 * KanbanColumn — droppable column wrapper.
 */

import type { ColumnId } from "../services/db";

export class KanbanColumn {
  public element: HTMLElement;
  public columnId: ColumnId;
  private dropZone: HTMLElement;

  constructor(element: HTMLElement, columnId: ColumnId) {
    this.element = element;
    this.columnId = columnId;
    this.dropZone = element.querySelector("[data-column]") as HTMLElement;
  }

  getDropZone(): HTMLElement {
    return this.dropZone;
  }
}
