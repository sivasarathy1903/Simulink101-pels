import { Team } from "./types";

export const INITIAL_TEAMS: Team[] = [
  {
    id: "team-1",
    rank: 1,
    name: "APEX DYNAMICS",
    institution: "SSN Student Branch Chapter",
    totalPoints: 92,
    status: "All parameters validated.",
    metrics: {
      circuitDesign: 28,
      reportSubmission: 28,
      result: 36,
    },
    lastUpdated: "5m ago",
    runHistory: [
      { run: 1, score: 70 },
      { run: 2, score: 85 },
      { run: 3, score: 92 },
    ],
    tags: ["Alex Mercer", "Sara Connor", "John Doe"],
  },
  {
    id: "team-2",
    rank: 2,
    name: "KINETIC CHARGERS",
    institution: "CEG IEEE PES",
    totalPoints: 85,
    status: "Minor harmonics detected.",
    metrics: {
      circuitDesign: 25,
      reportSubmission: 27,
      result: 33,
    },
    lastUpdated: "12m ago",
    runHistory: [
      { run: 1, score: 65 },
      { run: 2, score: 78 },
      { run: 3, score: 85 },
    ],
    tags: ["Alice Vance", "Bob Smith"],
  },
  {
    id: "team-3",
    rank: 3,
    name: "RESONANCE LABS",
    institution: "MIT IEEE PELS",
    totalPoints: 78,
    status: "Control loop feedback verified.",
    metrics: {
      circuitDesign: 22,
      reportSubmission: 24,
      result: 32,
    },
    lastUpdated: "25m ago",
    runHistory: [
      { run: 1, score: 60 },
      { run: 2, score: 70 },
      { run: 3, score: 78 },
    ],
    tags: ["Charlie Kelly", "Dennis Reynolds", "Mac"],
  }
];
