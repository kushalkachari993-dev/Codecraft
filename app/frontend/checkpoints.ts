import type { CloudCheckpoint } from "../cloud/checkpoints";
import type { CloudLesson } from "../cloud/model";
import type { FrontendPaceId } from "./track";

type Seed = { question: string; correct: string; wrongA: string; wrongB: string; explanation: string };
function rotate(seed: Seed, offset: number): CloudCheckpoint {
  const original = [seed.correct, seed.wrongA, seed.wrongB] as [string, string, string];
  const shift = offset % original.length;
  const options = [...original.slice(shift), ...original.slice(0, shift)] as [string, string, string];
  return { question: seed.question, options, answer: (original.length - shift) % original.length, explanation: seed.explanation };
}

export function getFrontendCheckpoints(paceId: FrontendPaceId, lesson: CloudLesson): CloudCheckpoint[] {
  const boundary = String(lesson.solution.boundary);
  const failure = String(lesson.solution.failure_mode);
  const timeout = Number(lesson.solution.timeout_ms);
  const retries = Number(lesson.solution.retry_limit);
  const controls = Array.isArray(lesson.solution.safeguards) ? lesson.solution.safeguards.map(String) : [];
  const review = paceId === "expert" ? "platform review" : paceId === "intermediate" ? "release review" : "interface review";
  const seeds: Seed[] = [
    {
      question: `A user reaches the ${boundary} boundary and encounters “${failure}”. Which response preserves context and access?`,
      correct: `Expose a clear state and recovery path, preserve the user’s work, and verify ${controls[0]} with keyboard and assistive-technology behavior.`,
      wrongA: "Replace the view with a generic spinner until the user refreshes the page.",
      wrongB: "Log the failure silently because visible errors reduce conversion.",
      explanation: `The failure is part of the interface contract. ${controls[0]} must work in the rendered experience, not only exist in source code.`,
    },
    {
      question: `The ${lesson.title} interaction has a ${timeout} ms budget and ${retries} ${retries === 1 ? "retry" : "retries"}. What is the safest implementation?`,
      correct: "Cancel obsolete work, retry only repeat-safe operations within one budget, and keep the current UI state understandable.",
      wrongA: "Start a fresh timer and retry loop in every component so each request gets a full chance.",
      wrongB: "Remove the budget because waiting indefinitely avoids showing an error.",
      explanation: "One user intent needs one bounded lifecycle. Layered retries and stale responses create duplicate work and state races.",
    },
    {
      question: `Which evidence is sufficient for the ${lesson.title} ${review}?`,
      correct: `A repeatable scenario covers normal and “${failure}” states, measures the user signal, and verifies ${controls.slice(1).join(" plus ")}.`,
      wrongA: "The page looks correct at one desktop width and the console has no errors.",
      wrongB: "The component snapshot is unchanged, so interaction and accessibility checks are unnecessary.",
      explanation: "Frontend evidence must cover real states and user input paths. Appearance or syntax alone cannot establish behavior, access, or resilience.",
    },
  ];
  return seeds.map((seed, index) => rotate(seed, lesson.id + index + (paceId === "intermediate" ? 1 : paceId === "expert" ? 2 : 0)));
}
