export interface TeamMetrics {
  circuitDesign?: number;
  reportSubmission?: number;
  result?: number;
  modelDesign?: number;
  simulationAccuracy?: number;
  systemPerformance?: number;
  innovation?: number;
  technicalApproach?: number;
  resultAnalysis?: number;
  presentation?: number;
}

export interface Team {
  id: string;
  rank: number;
  name: string;
  institution: string;
  totalPoints: number; // sum of metrics
  status: string;
  metrics: TeamMetrics;
  lastUpdated: string;
  runHistory: { run: number; score: number }[];
  tags: string[];
}

export interface ModuleChallenge {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
}
