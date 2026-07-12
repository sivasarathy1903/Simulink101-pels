export interface TeamMetrics {
  // Task 1: Circuit Design Phase
  t1_circuit?: number;    // out of 30
  t1_report?: number;     // out of 30
  t1_result?: number;     // out of 40

  // Task 2: Simulation Accuracy Phase
  t2_circuit?: number;    // out of 30
  t2_report?: number;     // out of 30
  t2_result?: number;     // out of 40

  // Task 3: Results & Report Phase
  t3_circuit?: number;    // out of 30
  t3_report?: number;     // out of 30
  t3_result?: number;     // out of 40

  // Legacy fields (kept for backward compat)
  task1Released?: boolean;
  task1Link?: string;
  task2Released?: boolean;
  task2Link?: string;
  task3Released?: boolean;
  task3Link?: string;
  [key: string]: number | boolean | string | undefined;
}

export interface Team {
  id: string;
  rank: number;
  name: string;
  institution: string;
  totalPoints: number; // cumulative sum across all 3 tasks (max 300)
  status: string;
  metrics: TeamMetrics;
  lastUpdated: string;
  runHistory: { run: number; score: number }[];
  tags: string[];       // used for team member names
}

export interface ModuleChallenge {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}
