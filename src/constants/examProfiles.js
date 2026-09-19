// ---------------------------------------------------------------------------
// Exam pattern data. Timer + word limits here are reasonable placeholders —
// SBI/IBPS don't publish an official per-question word limit, so adjust these
// numbers to match whatever you actually saw on screen on the 12th.
// ---------------------------------------------------------------------------
export const EXAM_PROFILES = [
  {
    id: "sbi-po-mains",
    name: "SBI PO Mains — Descriptive Test",
    timerMinutes: 30,
    questions: [
      { id: "email", title: "Email Writing", wordLimit: 150 },
      { id: "situation", title: "Situation Analysis", wordLimit: 160 },
      { id: "report", title: "Report / Precis Writing", wordLimit: 150 },
    ],
  },
  {
    id: "ibps-po-mains",
    name: "IBPS PO Mains — Descriptive Test",
    timerMinutes: 30,
    questions: [
      { id: "essay", title: "Essay Writing", wordLimit: 300 },
      { id: "rc", title: "Comprehension(Set of 3)", wordLimit: 150 },
    ],
  },
];
