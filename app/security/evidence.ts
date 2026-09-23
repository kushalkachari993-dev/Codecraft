import type { CloudEvidenceExercise } from "../cloud/evidence";
import type { CloudLesson } from "../cloud/model";
import { SECURITY_TOPICS } from "./curriculum";
import type { SecurityPaceId } from "./track";

export function getSecurityEvidenceExercise(paceId: SecurityPaceId, lesson: CloudLesson): CloudEvidenceExercise {
  const spec = SECURITY_TOPICS[paceId][lesson.id - 1];
  const kind = lesson.id % 3 === 0 ? "timeline" : lesson.id % 3 === 1 ? "logs" : "plan-diff";
  const evidence = kind === "logs"
    ? `10:14:02Z req-7f2 actor=verified-user action=${spec.allow} decision=allow signal=${spec.signal}\n10:14:04Z req-7f3 actor=untrusted action=${spec.deny} decision=allow signal=${spec.signal}\n10:14:05Z req-7f3 review=policy-gap note=${spec.failure}`
    : kind === "timeline"
      ? `09:01 baseline: ${spec.signal} normal\n09:03 change applied: ${spec.controls[0]} removed\n09:07 observed: ${spec.deny} succeeds\n09:10 rollout paused; evidence preserved\n09:14 control restored; blocked request retested\n09:17 ${spec.signal} returns to expected level`
      : `Security policy diff · ${lesson.title}\n+ allowed_behavior: ${spec.allow}\n- blocked_behavior: ${spec.deny}\n- control: ${spec.controls[1]}\n= signal to verify: ${spec.signal}\nReview note: ${spec.failure}`;
  const correct = kind === "logs"
    ? `Trace req-7f3 to the boundary; deny ${spec.deny} while confirming req-7f2 still succeeds.`
    : kind === "timeline"
      ? `Treat the changed ${spec.controls[0]} control as a leading hypothesis, keep the rollout paused, and retest both paths.`
      : `Block approval until ${spec.deny} is explicitly denied and ${spec.controls[1]} is restored.`;
  const wrongA = kind === "logs" ? "Block every user because one untrusted action was allowed." : "Approve the change because the file parses and the service started.";
  const wrongB = kind === "timeline" ? "Declare the exact root cause proven by timing alone." : "Ignore the denied path because the normal request succeeded.";
  const original = [correct, wrongA, wrongB] as [string, string, string];
  const shift = (lesson.id + (paceId === "expert" ? 2 : paceId === "intermediate" ? 1 : 0)) % 3;
  const options = [...original.slice(shift), ...original.slice(0, shift)] as [string, string, string];
  return {
    kind, label: kind === "logs" ? "Security decision logs" : kind === "timeline" ? "Incident timeline" : "Security policy diff",
    title: kind === "logs" ? "Follow the unsafe decision" : kind === "timeline" ? "Test the change hypothesis" : "Review the boundary change",
    briefing: `The fictional Relay service is being reviewed for ${lesson.title}. Use only the evidence shown, and keep the permitted path working.`,
    evidence,
    question: kind === "logs" ? "What is the narrowest supported next action?" : kind === "timeline" ? "What conclusion and response are supported by the sequence?" : "What should happen before this change is approved?",
    options, answer: options.indexOf(correct),
    explanation: `The evidence points to a boundary problem: ${spec.failure} Verify a normal request and a denied request with ${spec.signal}; preserve uncertainty where the record cannot prove root cause.`,
  };
}
