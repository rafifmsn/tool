import Dexie, { type Table } from "dexie";

export interface Tab {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface TextFile {
  id: string;
  name: string;
  content: string;
  type: "markdown";
  tabId: string;
  updatedAt: number;
}

export interface AttachedAsset {
  id: string;
  name: string;
  data: Blob;
  type: "image" | "pdf";
  tabId: string;
  mimeType: string;
  size: number;
  updatedAt: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  column: "todo" | "inprogress" | "done";
  order: number;
  tabId: string;
  createdAt: number;
}

export type ColumnId = "todo" | "inprogress" | "done";

export const COLUMN_LABELS: Record<ColumnId, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  tabId: string;
  createdAt: number;
}

class NoteEditorDB extends Dexie {
  tabs!: Table<Tab, string>;
  files!: Table<TextFile, string>;
  assets!: Table<AttachedAsset, string>;
  kanban!: Table<KanbanCard, string>;
  tasks!: Table<Task, string>;

  constructor() {
    super("NoteEditorDB");
    this.version(1).stores({
      files: "id, name, updatedAt",
      assets: "id, name, type, updatedAt",
      kanban: "id, column, order",
    });
    this.version(2).stores({
      tabs: "id, order",
      files: "id, name, tabId, updatedAt",
      assets: "id, name, type, tabId, updatedAt",
      kanban: "id, column, order, tabId",
    });
    this.version(3).stores({
      tabs: "id, order",
      files: "id, name, tabId, updatedAt",
      assets: "id, name, type, tabId, updatedAt",
      kanban: "id, column, order, tabId",
      tasks: "id, completed, order, tabId",
    });
  }
}

export const DEFAULT_TABS: Omit<Tab, "createdAt">[] = [
  { id: "tab-default-1", name: "Notes", order: 0 },
  { id: "tab-default-2", name: "Ideas", order: 1 },
  { id: "tab-default-3", name: "Archive", order: 2 },
];

export const db = new NoteEditorDB();

// ── Tab helpers ──

export async function getTabs(): Promise<Tab[]> {
  return db.tabs.orderBy("order").toArray();
}

export async function getTab(id: string): Promise<Tab | undefined> {
  return db.tabs.get(id);
}

export async function saveTab(tab: Tab): Promise<void> {
  await db.tabs.put(tab);
}

export async function initDefaultTabs(): Promise<Tab[]> {
  const existing = await getTabs();
  if (existing.length > 0) return existing;
  const tabs: Tab[] = DEFAULT_TABS.map((t) => ({
    ...t,
    createdAt: Date.now(),
  }));
  await db.tabs.bulkPut(tabs);

  // Migrate: assign legacy items without tabId to the first tab
  const firstTabId = tabs[0].id;

  const legacyFiles = await db.files.filter((f) => !f.tabId).toArray();
  for (const f of legacyFiles) {
    await db.files.update(f.id, { tabId: firstTabId });
  }

  const legacyKanban = await db.kanban.filter((c) => !c.tabId).toArray();
  for (const c of legacyKanban) {
    await db.kanban.update(c.id, { tabId: firstTabId });
  }

  const allAssets = await db.assets.filter((a) => !a.tabId).toArray();
  for (const a of allAssets) {
    await db.assets.update(a.id, { tabId: firstTabId });
  }

  return tabs;
}

export async function deleteTab(id: string): Promise<void> {
  await db.tabs.delete(id);
}

// ── File helpers ──

export function generateId(): string {
  return crypto.randomUUID();
}

export async function getAllFiles(tabId?: string): Promise<TextFile[]> {
  let query = db.files.orderBy("name");
  if (tabId) {
    return db.files.where("tabId").equals(tabId).sortBy("name");
  }
  return query.toArray();
}

export async function getFile(id: string): Promise<TextFile | undefined> {
  return db.files.get(id);
}

export async function saveFile(file: TextFile): Promise<void> {
  await db.files.put({ ...file, updatedAt: Date.now() });
}

export async function deleteFile(id: string): Promise<void> {
  await db.files.delete(id);
}

export async function renameFile(id: string, newName: string): Promise<void> {
  await db.files.update(id, { name: newName });
}

export async function moveFile(id: string, newTabId: string): Promise<void> {
  await db.files.update(id, { tabId: newTabId });
}

export async function deleteAllFiles(tabId?: string): Promise<void> {
  if (tabId) {
    const files = await db.files.where("tabId").equals(tabId).toArray();
    await db.files.bulkDelete(files.map((f) => f.id));
  } else {
    await db.files.clear();
  }
}

// ── Asset helpers ──

export async function getAllAssets(tabId?: string): Promise<AttachedAsset[]> {
  if (tabId) {
    return db.assets.where("tabId").equals(tabId).sortBy("name");
  }
  return db.assets.orderBy("name").toArray();
}

export async function getAsset(id: string): Promise<AttachedAsset | undefined> {
  return db.assets.get(id);
}

export async function saveAsset(asset: AttachedAsset): Promise<void> {
  await db.assets.put({ ...asset, updatedAt: Date.now() });
}

export async function deleteAsset(id: string): Promise<void> {
  await db.assets.delete(id);
}

export async function renameAsset(id: string, newName: string): Promise<void> {
  await db.assets.update(id, { name: newName });
}

export async function moveAsset(id: string, newTabId: string): Promise<void> {
  await db.assets.update(id, { tabId: newTabId });
}

export async function deleteAllAssets(tabId?: string): Promise<void> {
  if (tabId) {
    const assets = await db.assets.where("tabId").equals(tabId).toArray();
    await db.assets.bulkDelete(assets.map((a) => a.id));
  } else {
    await db.assets.clear();
  }
}

// ── Kanban helpers ──

export async function getKanbanCards(tabId?: string): Promise<KanbanCard[]> {
  if (tabId) {
    return db.kanban.where("tabId").equals(tabId).sortBy("order");
  }
  return db.kanban.orderBy("order").toArray();
}

export async function getKanbanCardsByColumn(
  column: ColumnId,
  tabId?: string,
): Promise<KanbanCard[]> {
  let collection = db.kanban.where("column").equals(column);
  const cards = await collection.toArray();
  if (tabId) {
    return cards
      .filter((c) => c.tabId === tabId)
      .sort((a, b) => a.order - b.order);
  }
  return cards.sort((a, b) => a.order - b.order);
}

export async function saveKanbanCard(card: KanbanCard): Promise<void> {
  await db.kanban.put(card);
}

export async function deleteKanbanCard(id: string): Promise<void> {
  await db.kanban.delete(id);
}

export async function deleteAllKanbanCards(tabId?: string): Promise<void> {
  if (tabId) {
    const cards = await db.kanban.where("tabId").equals(tabId).toArray();
    await db.kanban.bulkDelete(cards.map((c) => c.id));
  } else {
    await db.kanban.clear();
  }
}

export async function updateKanbanCardColumn(
  id: string,
  column: ColumnId,
  order: number,
): Promise<void> {
  await db.kanban.update(id, { column, order });
}

export async function getNextKanbanOrder(
  column: ColumnId,
  tabId?: string,
): Promise<number> {
  const cards = await getKanbanCardsByColumn(column, tabId);
  if (cards.length === 0) return 0;
  return Math.max(...cards.map((c) => c.order)) + 1;
}

// ── Task helpers ──

export async function getTasks(tabId?: string): Promise<Task[]> {
  if (tabId) {
    return db.tasks.where("tabId").equals(tabId).sortBy("order");
  }
  return db.tasks.orderBy("order").toArray();
}

export async function saveTask(task: Task): Promise<void> {
  await db.tasks.put(task);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function deleteAllTasks(tabId?: string): Promise<void> {
  if (tabId) {
    const tasks = await db.tasks.where("tabId").equals(tabId).toArray();
    await db.tasks.bulkDelete(tasks.map((t) => t.id));
  } else {
    await db.tasks.clear();
  }
}

export async function getNextTaskOrder(tabId?: string): Promise<number> {
  const tasks = await getTasks(tabId);
  if (tasks.length === 0) return 0;
  return Math.max(...tasks.map((t) => t.order)) + 1;
}
