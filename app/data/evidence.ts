import type { CloudEvidenceExercise, CloudEvidenceKind } from "../cloud/evidence";
import type { CloudLesson } from "../cloud/model";
import type { DataPaceId } from "./track";

const kinds: CloudEvidenceKind[] = ["logs", "traces", "timeline", "plan-diff", "cost-report"];
const offsets: Record<DataPaceId, number> = { beginner: 0, intermediate: 2, expert: 4 };

export function getDataEvidenceExercise(paceId: DataPaceId, lesson: CloudLesson): CloudEvidenceExercise {
  const kind = kinds[(lesson.id - 1 + offsets[paceId]) % kinds.length];
  const failure = String(lesson.solution.failure_mode);
  const control = lesson.checks[0].name;
  let label = "Pipeline logs", title = "Reconcile a failed batch", evidence = `run=data-${lesson.id}-7f2 interval=2026-09-20\nextract rows=128420\ntransform accepted=128106 rejected=314\npublish rows=127806 status=success\nquality ${control}=missing\nwarning ${failure}`;
  let question = "Which response is best supported by this evidence?";
  let correct = "Quarantine the published interval, locate the missing 300 accepted records, and reconcile with the run manifest before replay.";
  let wrongA = "Approve the run because publish status is success.";
  let wrongB = "Delete the 314 rejected records so the counts match.";
  let explanation = "The arithmetic localizes a loss between accepted transformation output and publication. Rejected records are accounted for and should remain inspectable.";
  if (kind === "traces") {
    label = "Distributed stage trace"; title = "Find the skewed stage";
    evidence = `job=${lesson.id} input=840 GB\nstage 1 read=840 GB p95_task=42 s\nstage 2 shuffle=1.4 TB p50_task=38 s p95_task=812 s\nstage 2 largest_partition=196 GB median_partition=2.1 GB\nstage 3 write=221 GB p95_task=55 s`;
    question = "What should be investigated first?"; correct = "Profile stage 2 join keys and isolate the hot key before changing cluster size."; wrongA = "Double every worker because stage 2 has the longest duration."; wrongB = "Compress the final output because stage 3 writes 221 GB."; explanation = "The extreme partition and duration spread identify skew in the shuffle stage. More workers do not split a single hot partition.";
  } else if (kind === "timeline") {
    label = "Incident timeline"; title = "Test the release hypothesis";
    evidence = `09:00 transform v${lesson.id}.0 at 10%\n09:07 ${failure}\n09:10 freshness SLO breaches\n09:12 rollout paused\n09:18 v${lesson.id - 1}.9 restored\n09:24 counts and freshness return to baseline`;
    question = "What conclusion is justified?"; correct = `Keep the new transform paused as the leading hypothesis and reproduce ${control} on the affected interval.`; wrongA = "The exact faulty line is proven by the rollback."; wrongB = "Resume rollout because the incident is over."; explanation = "Timing and recovery support a strong release hypothesis, but root cause still requires controlled interval-level reproduction and reconciliation.";
  } else if (kind === "plan-diff") {
    label = "Schema and plan diff"; title = "Review a compatibility regression";
    evidence = `@@ orders contract @@\n- order_id: string required\n+ order_id: integer optional\n- event_time: timestamp_utc required\n+ event_time: string optional\n@@ load plan @@\n- merge on order_id\n+ append all rows\n${control}: REGRESSED`;
    question = "What must block approval?"; correct = "Restore a compatible key and timestamp contract, then replay-test merge behavior with old and new records."; wrongA = "Approve because integers are smaller than strings."; wrongB = "Cast fields in the dashboard and leave the append behavior unchanged."; explanation = "The diff changes identity, time semantics, and load behavior together. Consumers and replays can duplicate or misorder records unless compatibility is explicit.";
  } else if (kind === "cost-report") {
    label = "Pipeline cost report"; title = "Find avoidable data work";
    evidence = `job,scan_gb,shuffle_gb,output_gb,cost\nextract,84,0,82,$9\njoin,840,1420,118,$146\npublish,118,0,116,$14\nqueries_daily=12 partition_pruning=8% freshness=within_slo`;
    question = "Which first optimization is justified?"; correct = "Inspect join filters, partition pruning, and key skew, then compare scan and shuffle per successful output GB."; wrongA = "Delete historical partitions because they cost money."; wrongB = "Compress published output first because every output byte caused the shuffle."; explanation = "The report points to excessive scan and shuffle work in the join. A bounded plan change should retain freshness and correctness while improving unit cost.";
  }
  const source = [correct, wrongA, wrongB] as const; const shift = (lesson.id + offsets[paceId]) % 3;
  const options = source.map((_, index) => source[(index + shift) % 3]) as [string, string, string];
  return { kind, label, title, briefing: `Investigate evidence for ${lesson.title} without assuming task success equals data correctness.`, evidence: `lesson ${lesson.id} · ${lesson.title}\n${evidence}`, question, options, answer: options.indexOf(correct), explanation };
}
