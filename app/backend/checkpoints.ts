import type { CloudCheckpoint } from "../cloud/checkpoints";
import type { CloudLesson } from "../cloud/model";
import type { BackendPaceId } from "./track";

type Seed = { question: string; correct: string; wrongA: string; wrongB: string; explanation: string };

function rotate(seed: Seed, offset: number): CloudCheckpoint {
  const original = [seed.correct, seed.wrongA, seed.wrongB] as [string, string, string];
  const shift = offset % original.length;
  const rotated = [...original.slice(shift), ...original.slice(0, shift)] as [string, string, string];
  return { question: seed.question, options: rotated, answer: (original.length - shift) % original.length, explanation: seed.explanation };
}

export function getBackendCheckpoints(paceId: BackendPaceId, lesson: CloudLesson): CloudCheckpoint[] {
  const boundary = String(lesson.solution.boundary);
  const failure = String(lesson.solution.failure_mode);
  const timeout = Number(lesson.solution.timeout_ms);
  const retries = Number(lesson.solution.retry_limit);
  const safeguards = Array.isArray(lesson.solution.safeguards) ? lesson.solution.safeguards.map(String) : [];
  const depth = paceId === "expert" ? "architecture review" : paceId === "intermediate" ? "production readiness review" : "service review";
  const seeds: Seed[] = [
    {
      question: `A ${boundary} request fails halfway through. Which response best preserves the lesson contract?`,
      correct: `Classify “${failure}”, keep one correlation path, and apply ${safeguards[0]} at the named boundary.`,
      wrongA: "Retry every dependency indefinitely because successful retries hide the original failure.",
      wrongB: "Return success immediately and reconcile only if a customer reports a problem.",
      explanation: `The design names ${failure} as a first-class scenario. ${safeguards[0]} and correlated evidence keep the response bounded and reviewable.`,
    },
    {
      question: `During a ${lesson.title} traffic spike, the operation has a ${timeout} ms deadline and ${retries} ${retries === 1 ? "retry" : "retries"}. What is the safest change?`,
      correct: "Preserve one end-to-end deadline, retry only safe operations within its remaining budget, and shed excess work deliberately.",
      wrongA: "Give each layer a fresh deadline and retry count so all dependencies get a full chance.",
      wrongB: "Remove the deadline; waiting is safer than returning an explicit overload response.",
      explanation: "Deadline and retry budgets belong to the complete operation. Resetting them at each layer creates retry amplification and unbounded latency.",
    },
    {
      question: `Which evidence would let a reviewer approve the ${lesson.title} ${depth}?`,
      correct: `A repeatable scenario shows the normal path, injects “${failure}”, measures the user-facing signal, and verifies ${safeguards.slice(1).join(" and ")}.`,
      wrongA: "A configuration file parses successfully and the service starts once on a developer laptop.",
      wrongB: "A dashboard is green during normal traffic, so failure and recovery tests are unnecessary.",
      explanation: `Architecture evidence must exercise the stated failure and verify independent controls. Syntax and normal-path health alone cannot prove ${lesson.objective.toLowerCase()}`,
    },
  ];
  return seeds.map((seed, index) => rotate(seed, lesson.id + index + (paceId === "intermediate" ? 1 : paceId === "expert" ? 2 : 0)));
}
