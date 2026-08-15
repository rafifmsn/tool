export interface SplitRecord {
  lap: number;
  splitTime: number; // ms since last split or start
  totalTime: number; // ms from start
}

export interface StopwatchState {
  elapsed: number; // ms elapsed
  running: boolean;
  splits: SplitRecord[];
  lapCount: number;
}
