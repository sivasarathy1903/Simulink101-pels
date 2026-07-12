import { Team } from "./types";

export const INITIAL_TEAMS: Team[] = [
  {
    id: "team-1",
    rank: 1,
    name: "APEX DYNAMICS",
    institution: "SSN IEEE PELS",
    totalPoints: 255,
    status: "All tasks verified.",
    metrics: {
      t1_circuit: 28, t1_report: 27, t1_result: 38,
      t2_circuit: 25, t2_report: 26, t2_result: 35,
      t3_circuit: 24, t3_report: 25, t3_result: 27,
    },
    lastUpdated: "5m ago",
    runHistory: [{ run: 1, score: 180 }, { run: 2, score: 220 }, { run: 3, score: 255 }],
    tags: ["Alex Mercer", "Sara Connor", "John Doe"],
  },
  {
    id: "team-2",
    rank: 2,
    name: "KINETIC CHARGERS",
    institution: "CEG IEEE PES",
    totalPoints: 220,
    status: "Task 2 optimized.",
    metrics: {
      t1_circuit: 25, t1_report: 24, t1_result: 33,
      t2_circuit: 22, t2_report: 24, t2_result: 31,
      t3_circuit: 20, t3_report: 22, t3_result: 19,
    },
    lastUpdated: "12m ago",
    runHistory: [{ run: 1, score: 160 }, { run: 2, score: 195 }, { run: 3, score: 220 }],
    tags: ["Alice Vance", "Bob Smith"],
  },
  {
    id: "team-3",
    rank: 3,
    name: "RESONANCE LABS",
    institution: "MIT IEEE PELS",
    totalPoints: 185,
    status: "Control loop verified.",
    metrics: {
      t1_circuit: 22, t1_report: 21, t1_result: 30,
      t2_circuit: 20, t2_report: 20, t2_result: 28,
      t3_circuit: 15, t3_report: 14, t3_result: 15,
    },
    lastUpdated: "25m ago",
    runHistory: [{ run: 1, score: 130 }, { run: 2, score: 160 }, { run: 3, score: 185 }],
    tags: ["Charlie Kelly", "Dennis Reynolds", "Mac"],
  }
];
