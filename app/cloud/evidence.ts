import type { CloudLesson } from "./model";
import type { CloudPaceId } from "./track";

export type CloudEvidenceKind = "logs" | "traces" | "timeline" | "plan-diff" | "cost-report";
export type CloudEvidenceExercise = {
  kind: CloudEvidenceKind;
  label: string;
  title: string;
  briefing: string;
  evidence: string;
  question: string;
  options: [string, string, string];
  answer: number;
  explanation: string;
};

type EvidenceSeed = Omit<CloudEvidenceExercise, "options" | "answer"> & { correct: string; wrongA: string; wrongB: string };
const kinds: CloudEvidenceKind[] = ["logs", "traces", "timeline", "plan-diff", "cost-report"];
const paceOffset: Record<CloudPaceId, number> = { beginner: 0, intermediate: 2, expert: 4 };

function seedFor(kind: CloudEvidenceKind, lesson: CloudLesson): EvidenceSeed {
  const focus = lesson.title;
  const primary = lesson.checks[0];
  const secondary = lesson.checks[1] ?? primary;
  const starterSignal = lesson.observations(lesson.starter)[0] ?? `${primary.name}: needs repair.`;
  if (kind === "logs") return {
    kind, label: "Structured logs", title: "Follow the correlation ID",
    briefing: `A user journey related to ${focus} is failing. Find the earliest useful dependency signal instead of guessing from the final status code.`,
    evidence: [
      { ts: "10:14:03.104Z", level: "info", service: "edge", correlation_id: "req-7f2", route: "/relay", status: 502 },
      { ts: "10:14:03.087Z", level: "error", service: "relay-api", correlation_id: "req-7f2", operation: "load-policy", dependency: "policy-store", error: "deadline_exceeded" },
      { ts: "10:14:01.584Z", level: "warn", service: "policy-store", correlation_id: "req-7f2", pool_wait_ms: 1450, available_connections: 0 },
      { ts: "10:14:01.570Z", level: "warn", lesson: focus, control: primary.name, observed: starterSignal },
    ].map((entry) => JSON.stringify(entry)).join("\n"),
    question: `Which next action is best supported by the logs for “${focus}”?`,
    correct: `Trace req-7f2 into policy-store, then test “${primary.name}” as a bounded hypothesis against the lesson signal.`,
    wrongA: "Increase every service timeout because the edge returned 502.",
    wrongB: "Restart the edge immediately; it is the component that recorded the user-visible status.",
    explanation: "The shared correlation ID connects the symptom to a dependency timeout and then to connection-pool wait. That evidence supports a bounded policy-store investigation before any broad change.",
  };
  if (kind === "traces") return {
    kind, label: "Distributed trace", title: "Locate the critical path",
    briefing: `The ${focus} request meets functional checks but misses its latency objective. Read parent and child spans as one causal path.`,
    evidence: `trace req-a91 · lesson ${lesson.id} · ${focus} · total 1,842 ms
├─ edge.receive             24 ms  OK
├─ relay-api.authorize      31 ms  OK
└─ relay-api.handle      1,774 ms  ERROR
   ├─ policy-store.read  1,642 ms  deadline_exceeded
   ├─ control.evaluate      114 ms  ${primary.name}
   └─ response.encode       18 ms  OK
signal: ${starterSignal}`,
    question: `What is the strongest first hypothesis for the ${focus} latency?`,
    correct: "The policy-store read dominates the critical path; inspect that dependency and its saturation signals first.",
    wrongA: "Response encoding is the bottleneck because it is the final child span.",
    wrongB: "The edge is slow because every trace begins there.",
    explanation: "The longest failing child span accounts for almost all request time. The trace localizes investigation to the dependency without claiming a root cause that still needs metrics and logs.",
  };
  if (kind === "timeline") return {
    kind, label: "Incident timeline", title: "Test the release hypothesis",
    briefing: `An incident began during a change to ${focus}. Use chronology to select a reversible first response while preserving evidence.`,
    evidence: `09:01  preflight reports “${starterSignal}”
09:02  relay-api v2.8.0 reaches 10% canary for ${focus}
09:05  policy lookup p95 rises from 120 ms to 980 ms
09:07  availability SLO burn alert fires
09:09  canary reaches 25%; error rate doubles
09:11  rollout paused; incident commander assigned
09:14  canary rolled back to v2.7.4
09:17  p95 and error rate return to baseline`,
    question: `What conclusion and follow-up are justified for “${focus}”?`,
    correct: `Treat v2.8.0 as the leading hypothesis, keep it rolled back, and verify “${primary.name}” before another canary.`,
    wrongA: "Declare the exact code defect proven because recovery followed rollback.",
    wrongB: "Resume the rollout because the service recovered after the incident team intervened.",
    explanation: "Timing and recovery make the canary a strong hypothesis, but not a proven root cause. The safe response preserves recovery and gathers a focused comparison before re-release.",
  };
  if (kind === "plan-diff") return {
    kind, label: "Infrastructure plan diff", title: "Review destructive intent",
    briefing: `A proposed ${focus} change has a successful plan exit code. Decide whether the semantic changes are safe to approve.`,
    evidence: `Terraform review · ${focus}
${Object.keys(lesson.solution).slice(0, 4).map((key) => `  ~ module.lesson.${key}  ${JSON.stringify(lesson.solution[key])} -> ${JSON.stringify(lesson.starter[key])}`).join("\n")}

Control at risk: ${primary.name}
Secondary control: ${secondary.name}`,
    question: `What should the reviewer do before approving the ${focus} plan?`,
    correct: `Block approval and review the changes against “${primary.name}” and “${secondary.name}” as independent risks.`,
    wrongA: "Approve because the plan command completed and only three resources changed.",
    wrongB: "Review only the new public-access field because additions are riskier than deletions.",
    explanation: `A successful plan is syntax and dependency evidence, not safety approval. The diff regresses the verified lesson values, so “${primary.name}” and “${secondary.name}” each require explicit intent.`,
  };
  return {
    kind, label: "Cost report", title: "Separate growth from waste",
    briefing: `Monthly spend rose after the ${focus} change. Use unit cost and utilization to choose an investigation that protects reliability.`,
    evidence: `lesson,control
${JSON.stringify(focus)},${JSON.stringify(primary.name)}

service,usage_units,cost_credits,cost_per_unit,utilization
relay-api,1200000,8400,0.0070,68%
policy-store,1180000,15340,0.0130,22%
edge-egress,1210000,14520,0.0120,74%
previous_total,1185000,26700,0.0225,n/a
current_total,1200000,38260,0.0319,n/a`,
    question: `Which first action is best supported by the ${focus} cost evidence?`,
    correct: "Investigate policy-store idle capacity and edge-egress unit cost, then test bounded changes against the reliability baseline.",
    wrongA: "Scale every service down immediately because the total bill increased.",
    wrongB: "Buy a long commitment for all current capacity before checking whether demand or efficiency changed.",
    explanation: "Usage barely changed while unit cost and low utilization identify specific hypotheses. A bounded review can reduce waste without trading away availability through an indiscriminate cut.",
  };
}

export function getCloudEvidenceExercise(paceId: CloudPaceId, lesson: CloudLesson): CloudEvidenceExercise {
  const kind = kinds[(lesson.id - 1 + paceOffset[paceId]) % kinds.length];
  const seed = seedFor(kind, lesson);
  const source = [seed.correct, seed.wrongA, seed.wrongB] as const;
  const shift = (lesson.id + paceOffset[paceId]) % source.length;
  const options = source.map((_, index) => source[(index + shift) % source.length]) as [string, string, string];
  return {
    kind: seed.kind,
    label: seed.label,
    title: seed.title,
    briefing: seed.briefing,
    evidence: seed.evidence,
    question: seed.question,
    explanation: seed.explanation,
    options,
    answer: options.indexOf(seed.correct),
  };
}
