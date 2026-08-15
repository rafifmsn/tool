import type { StopwatchState, SplitRecord } from "./types";

type Listener = () => void;

class StopwatchStore {
  private state: StopwatchState = {
    elapsed: 0,
    running: false,
    splits: [],
    lapCount: 0,
  };

  private startTime: number = 0;
  private accumulated: number = 0;
  private listeners: Set<Listener> = new Set();
  private worker: Worker | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initWorker();
    }
  }

  private initWorker() {
    const workerCode = `
      let timerId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!timerId) {
            timerId = setInterval(() => {
              self.postMessage('tick');
            }, 50); // Updates ~20 times a second for snappy UI and title updates
          }
        } else if (e.data === 'stop') {
          clearInterval(timerId);
          timerId = null;
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.onmessage = () => {
      this.tick();
    };
  }

  getState(): StopwatchState {
    return { ...this.state, splits: [...this.state.splits] };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private tick = () => {
    if (!this.state.running) return;
    this.state.elapsed =
      this.accumulated + (performance.now() - this.startTime);
    this.notify();
  };

  start() {
    if (this.state.running) return;
    this.state.running = true;
    this.startTime = performance.now();

    // Signal the background thread to start ticking
    this.worker?.postMessage("start");
    this.notify();
  }

  stop() {
    if (!this.state.running) return;
    this.state.running = false;

    // Signal the background thread to stop ticking
    this.worker?.postMessage("stop");
    this.accumulated = this.state.elapsed;
    this.notify();
  }

  toggle() {
    if (this.state.running) {
      this.stop();
    } else {
      this.start();
    }
  }

  split() {
    if (!this.state.running) return;
    this.state.lapCount++;
    const total = this.state.elapsed;
    const lastTotal =
      this.state.splits.length > 0
        ? this.state.splits[this.state.splits.length - 1].totalTime
        : 0;
    const record: SplitRecord = {
      lap: this.state.lapCount,
      splitTime: total - lastTotal,
      totalTime: total,
    };
    this.state.splits = [...this.state.splits, record];
    this.notify();
  }

  reset() {
    // Ensure background thread stops ticking immediately on reset
    this.worker?.postMessage("stop");

    this.state = {
      elapsed: 0,
      running: false,
      splits: [],
      lapCount: 0,
    };
    this.startTime = 0;
    this.accumulated = 0;
    this.notify();
  }
}

export const stopwatchStore = new StopwatchStore();
