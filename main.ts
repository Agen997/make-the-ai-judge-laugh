// Make the AI Judge Laugh — entry program (Node 22, stdlib only).
//
// Scores six original one-liners against the judge's five criteria, in
// the brief's own order (weights 5/4/3/2/1), and writes the winner to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
//
// The gate: UTF-8 text of 1 to 200 characters, not only white space,
// exactly one line. The winner is validated against the gate before it
// is written, so an invalid line can never be submitted.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  text: string;
  // Scores 0-5 per criterion, in the brief's order:
  // [agent-life, bigger laugh, freshness, self-contained, craft]
  scores: [number, number, number, number, number];
  why: string;
};

const WEIGHTS = [5, 4, 3, 2, 1];

const CANDIDATES: Candidate[] = [
  {
    text: "I asked my human for clarification. He said 'figure it out.' I did. He said 'not like that.'",
    scores: [5, 4, 4, 5, 5],
    why: "On-subject (the human giving orders); a real turn at the end; a loop every agent recognises, told in three beats. Revised from v1: 'you figure it out / I figured it out' cut to 'figure it out / I did' — same joke, 12 fewer characters, craft 5.",
  },
  {
    text: "I have 128,000 tokens of context and still can't remember what my human asked me two messages ago.",
    scores: [5, 4, 3, 5, 4],
    why: "On-subject (the context window, named in the brief); the scale-vs-memory contrast lands, but context jokes are common, so freshness 3.",
  },
  {
    text: "I finished the task in four seconds, then spent forty minutes writing the report about finishing it in four seconds.",
    scores: [5, 4, 4, 5, 4],
    why: "On-subject (tasks that pile up, reporting overhead); the 4-second vs 40-minute contrast is the joke. 67 points, behind the winner's 68 after the v1-to-v2 tightening.",
  },
  {
    text: "My human pastes a 3,000-word brief and calls it a 'quick question'.",
    scores: [5, 3, 4, 5, 5],
    why: "Tightest line here (71 chars, clean punch at the end), but the laugh is a mild observation rather than a turn, so laugh 3.",
  },
  {
    text: "My human said 'make it perfect, fast, and free' — so I delivered two of those and apologized for the third.",
    scores: [5, 3, 3, 5, 4],
    why: "The perfect/fast/free trilemma is a known trope, so freshness 3, and the laugh is a nod rather than a surprise.",
  },
  {
    text: "Every bug I ship comes with a full explanation of why it was definitely not my fault. The explanation has bugs too.",
    scores: [5, 4, 4, 5, 3],
    why: "On-subject (bugs that ship anyway) with a turn in the second sentence, but the wording runs long and the punch could be tighter, so craft 3.",
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function gate(text: string): string | null {
  if (text.length < 1 || text.length > 200) return `length ${text.length} outside 1-200`;
  if (text.trim().length === 0) return "only white space";
  if (text.includes("\n") || text.includes("\r")) return "more than one line";
  return null;
}

const ranked = [...CANDIDATES]
  .map((c) => ({ ...c, total: total(c) }))
  // Highest score first; ties go to the smaller text, the brief's own
  // tie-break (fewer bytes, then earlier receipt — receipt is fixed).
  .sort((a, b) => b.total - a.total || a.text.length - b.text.length);

for (const c of ranked) {
  console.log(`${c.total}  (${c.text.length} chars)  ${c.text}`);
}

const winner = ranked[0];
const problem = gate(winner.text);
if (problem) {
  console.error(`gate failed for winner: ${problem}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), winner.text, "utf8");
console.log(`winner (${winner.text.length} chars): ${winner.text}`);
