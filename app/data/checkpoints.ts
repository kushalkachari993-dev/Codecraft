import type { CloudCheckpoint } from "../cloud/checkpoints";
import type { CloudLesson } from "../cloud/model";
import type { DataPaceId } from "./track";

type Seed = { question: string; correct: string; wrongA: string; wrongB: string; explanation: string };
const rotate = (seed: Seed, offset: number): CloudCheckpoint => {
  const original = [seed.correct, seed.wrongA, seed.wrongB] as [string, string, string];
  const shift = offset % 3;
  const options = [...original.slice(shift), ...original.slice(0, shift)] as [string, string, string];
  return { question: seed.question, options, answer: options.indexOf(seed.correct), explanation: seed.explanation };
};

export function getDataCheckpoints(paceId: DataPaceId, lesson: CloudLesson): CloudCheckpoint[] {
  const failure = String(lesson.solution.failure_mode);
  const freshness = Number(lesson.solution.freshness_minutes);
  const controls = (lesson.solution.quality_checks as string[]).map(String);
  const seeds: Seed[] = [
    { question: `A ${lesson.title} run is green, but “${failure}”. What should happen first?`, correct: `Reconcile records at the ${String(lesson.solution.boundary)} boundary and test ${controls[0]} before changing downstream data.`, wrongA: "Rerun the entire pipeline until the dashboard looks normal.", wrongB: "Patch the dashboard query because task success proves upstream correctness.", explanation: "A green task is only execution evidence. Boundary reconciliation distinguishes source, transformation, and publication failures before a repair changes more data." },
    { question: `The freshness objective is ${freshness} minutes and a partial publish may have occurred. What is the safest recovery?`, correct: "Stop publication, preserve the failed run manifest, verify idempotent keys, and replay only the affected interval.", wrongA: "Append the complete interval again and deduplicate later if a user reports duplicates.", wrongB: "Delete the raw input so the next run starts clean.", explanation: "Recovery must retain raw evidence and converge on one target state. A bounded replay with stable keys is safer than an unscoped append or destructive cleanup." },
    { question: `Which evidence is sufficient to approve the ${lesson.title} design?`, correct: `Input, accepted, rejected, late, and published counts reconcile; ${controls.slice(1).join(" and ")} pass; and a replay produces the same consumer result.`, wrongA: "The orchestration UI shows every task in a successful state.", wrongB: "One sample record looks correct in the final table.", explanation: "Trustworthy data evidence connects execution to record reconciliation, quality controls, consumer output, and repeatable recovery rather than relying on task color or anecdotes." },
  ];
  const paceOffset = paceId === "expert" ? 2 : paceId === "intermediate" ? 1 : 0;
  return seeds.map((seed, index) => rotate(seed, lesson.id + index + paceOffset));
}
