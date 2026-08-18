export interface TeamMetrics {
  // Task 1: SOFT ROBOTIC REHABILITATION GLOVE (Max 100)
  t1_topology?: number;  // Understanding & Topology Selection (15)
  t1_calc?: number;      // Design Calculations (15)
  t1_model?: number;     // Simulation Model (20)
  t1_perf?: number;      // Output Performance (20)
  t1_eff?: number;       // Efficiency, Losses & Waveform Analysis (20)
  t1_report?: number;    // Report Quality (10)

  // Task 2: COMPACT DRONE CAMERA GIMBAL POWER STAGE (Max 100)
  t2_topology?: number;  // Understanding & Topology Selection (15)
  t2_calc?: number;      // Design Calculations (15)
  t2_model?: number;     // Simulation Model (20)
  t2_perf?: number;      // Output Performance (20)
  t2_eff?: number;       // Efficiency, Losses & Waveform Analysis (20)
  t2_report?: number;    // Report Quality (10)

  // Task 3: ELECTRIC TWO-WHEELER AUXILIARY POWER MODULE (Max 100)
  t3_topology?: number;  // Understanding & Topology Selection (15)
  t3_calc?: number;      // Design Calculations (15)
  t3_model?: number;     // Simulation Model (20)
  t3_perf?: number;      // Output Performance (20)
  t3_eff?: number;       // Efficiency, Losses & Waveform Analysis (20)
  t3_report?: number;    // Report Quality (10)

  // Legacy fallback fields
  t1_circuit?: number; t1_result?: number;
  t2_circuit?: number; t2_result?: number;
  t3_circuit?: number; t3_result?: number;

  // Unified Submissions & Password
  driveLink?: string;
  password?: string;
  
  // Event Config
  task1Released?: boolean; task1Link?: string;
  task2Released?: boolean; task2Link?: string;
  task3Released?: boolean; task3Link?: string;
  [key: string]: number | boolean | string | undefined;
}

export interface MemberDetail {
  name: string;
  dept: string;
  year: string;
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
  tags: string[];       // kept for backward compatibility
  members?: MemberDetail[];
}

export interface TaskInfo {
  id: string;
  key: number;
  title: string;
  product: string;
  givenSpecs: {
    input: string;
    output: string;
    power: string;
    priority: string;
  };
  topologyOptions: {
    name: string;
    desc: string;
    recommended?: boolean;
  }[];
  taskStatement: string;
  released: boolean;
  linkKey: string;
}

