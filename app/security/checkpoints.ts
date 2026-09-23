import type { CloudCheckpoint } from "../cloud/checkpoints";
import type { CloudLesson } from "../cloud/model";
import { SECURITY_TOPICS } from "./curriculum";
import type { SecurityPaceId } from "./track";

type Seed = { question: string; correct: string; wrongA: string; wrongB: string; explanation: string };
function rotate(seed: Seed, offset: number): CloudCheckpoint {
  const original = [seed.correct, seed.wrongA, seed.wrongB] as [string, string, string];
  const shift = offset % 3;
  const options = [...original.slice(shift), ...original.slice(0, shift)] as [string, string, string];
  return { question: seed.question, options, answer: (3 - shift) % 3, explanation: seed.explanation };
}
export function getSecurityCheckpoints(paceId: SecurityPaceId, lesson: CloudLesson): CloudCheckpoint[] {
  const spec = SECURITY_TOPICS[paceId][lesson.id - 1];
  const seeds: Seed[] = [
    { question: spec.question, correct: spec.answer, wrongA: spec.wrongA, wrongB: spec.wrongB, explanation: `${spec.mechanism} ${spec.decision}` },
    { question: `In the ${lesson.title} case, which pair of outcomes demonstrates a working boundary?`, correct: `Allow ${spec.allow}; deny ${spec.deny}.`, wrongA: `Allow ${spec.allow} and ${spec.deny} because the service remains available.`, wrongB: `Deny ${spec.allow} and ${spec.deny} because no requests can then be abused.`, explanation: `Security must preserve the legitimate path and refuse the specific unsafe path. ${spec.failure}` },
    { question: `A reviewer asks what would verify the ${lesson.title} repair. Which evidence is strongest?`, correct: `A normal and a denied request, correlated with ${spec.signal}, plus a tested recovery step.`, wrongA: "The policy file parses and the server starts once.", wrongB: "One green dashboard screenshot with no request-level comparison.", explanation: `The ${spec.signal} signal helps connect the control to observed behavior; syntax and healthy startup alone cannot prove authorization or recovery.` },
  ];
  return seeds.map((seed, index) => rotate(seed, lesson.id + index + (paceId === "intermediate" ? 1 : paceId === "expert" ? 2 : 0)));
}
