export interface TeamMetrics {
  modelDesign: number;         // out of 100
  simulationAccuracy: number;  // out of 100
  systemPerformance: number;   // out of 100
  innovation: number;          // out of 100
  technicalApproach: number;   // out of 100
  resultAnalysis: number;      // out of 100
  presentation: number;        // out of 100
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
