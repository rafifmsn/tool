/**
 * Editor — CodeMirror 6 instance with Markdown editing.
 */

import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

export class Editor {
  private view: EditorView;
  private onSave: ((content: string) => void) | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private onChange: ((content: string) => void) | null = null;
  private _unsaved = false;

  constructor(container: HTMLElement, initialContent = "") {
    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        basicSetup,
        markdown({ base: markdownLanguage }),
        oneDark,
        keymap.of([indentWithTab]),
        EditorView.lineWrapping,
        EditorView.theme({
          "&": {
            fontSize: "13px",
            height: "100%",
            backgroundColor: "var(--color-editor-bg)",
          },
          ".cm-scroller": {
            fontFamily:
              "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace",
          },
          ".cm-gutters": {
            backgroundColor: "var(--color-editor-bg)",
            borderRight: "1px solid var(--color-editor-border)",
            color: "var(--color-line-number)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "var(--color-surface-raised)",
          },
          ".cm-activeLine": {
            backgroundColor: "var(--color-surface-raised)",
          },
          ".cm-cursor": {
            borderLeftColor: "var(--color-text-primary)",
          },
          ".cm-selectionBackground": {
            backgroundColor: "var(--color-selection) !important",
          },
          ".cm-content": {
            caretColor: "var(--color-text-primary)",
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this._unsaved = true;
            const content = update.state.doc.toString();
            this.onChange?.(content);
            this.scheduleSave(content);
          }
        }),
      ],
    });

    this.view = new EditorView({
      state: startState,
      parent: container,
    });
  }

  setContent(content: string) {
    const current = this.view.state.doc.toString();
    if (current !== content) {
      this.view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: content,
        },
      });
    }
  }

  getContent(): string {
    return this.view.state.doc.toString();
  }

  setOnChange(cb: (content: string) => void) {
    this.onChange = cb;
  }

  setOnSave(cb: (content: string) => void) {
    this.onSave = cb;
  }

  get unsaved(): boolean {
    return this._unsaved;
  }

  set unsaved(val: boolean) {
    this._unsaved = val;
  }

  private scheduleSave(content: string) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.onSave?.(content);
      this._unsaved = false;
    }, 500);
  }

  destroy() {
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }
}
