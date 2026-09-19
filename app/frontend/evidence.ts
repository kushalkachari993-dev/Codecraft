import type { CloudEvidenceExercise, CloudEvidenceKind } from "../cloud/evidence";
import type { CloudLesson } from "../cloud/model";
import type { FrontendPaceId } from "./track";

const kinds: CloudEvidenceKind[] = ["logs", "traces", "timeline", "plan-diff", "cost-report"];
const offsets: Record<FrontendPaceId, number> = { beginner: 0, intermediate: 2, expert: 4 };

export function getFrontendEvidenceExercise(paceId: FrontendPaceId, lesson: CloudLesson): CloudEvidenceExercise {
  const kind = kinds[(lesson.id - 1 + offsets[paceId]) % kinds.length];
  const control = lesson.checks[0].name;
  const failure = String(lesson.solution.failure_mode);
  let label = "Browser console";
  let title = "Follow the failing interaction";
  let evidence = `10:14:03 click  button[name="Continue"]\n10:14:03 state  loading=true request=ui-7f2\n10:14:04 fetch  503 /api/relay request=ui-7f2\n10:14:04 render error="${failure}" focus=body\n10:14:05 warning control="${control}" status=missing`;
  let question = `Which next action is best supported for “${lesson.title}”?`;
  let correct = `Reproduce request ui-7f2, preserve the failure state, and verify “${control}” before changing unrelated components.`;
  let wrongA = "Retry continuously because the final network status is the only relevant signal.";
  let wrongB = "Suppress the console warning so the release dashboard stays green.";
  let explanation = "The shared request ID connects the action, failed response, rendered state, and missing control without guessing beyond the evidence.";
  if (kind === "traces") {
    label = "Performance trace"; title = "Locate the long task";
    evidence = `interaction ${lesson.id} · ${lesson.title} · INP 684 ms\n├─ input delay          18 ms\n├─ event handler       496 ms  LONG TASK\n│  ├─ data transform   421 ms\n│  └─ state update      75 ms\n├─ style + layout      132 ms\n└─ paint                38 ms\ncontrol: ${control}`;
    question = "Which first optimization is justified by this trace?";
    correct = "Profile and split the synchronous data transform, then remeasure the complete interaction.";
    wrongA = "Remove all CSS because layout appears after the handler.";
    wrongB = "Lazy-load the button icon because every transferred byte affects INP equally.";
    explanation = "The synchronous handler dominates this interaction. The trace localizes work without assuming why the transform is expensive.";
  } else if (kind === "timeline") {
    label = "Incident timeline"; title = "Test the frontend release hypothesis";
    evidence = `09:00  frontend v4.8 reaches 10% canary\n09:03  ${failure}\n09:05  task completion falls from 96% to 71%\n09:07  canary reaches 25%; client errors double\n09:09  rollout paused\n09:12  rollback to v4.7\n09:15  task completion and errors return to baseline`;
    question = "What conclusion and response does the timeline support?";
    correct = `Keep v4.8 rolled back as the leading hypothesis and verify “${control}” in a controlled preview before another canary.`;
    wrongA = "The exact defective line is proven because metrics recovered after rollback.";
    wrongB = "Resume the rollout because rollback fixed the immediate symptom.";
    explanation = "The timing supports the release as a strong hypothesis, not a complete root cause. A focused preview preserves safety and gathers discriminating evidence.";
  } else if (kind === "plan-diff") {
    label = "Accessibility audit diff"; title = "Review a semantic regression";
    evidence = `@@ ${lesson.title} preview @@\n- <button aria-describedby="status">Continue</button>\n+ <div class="button" onclick="next()">Continue</div>\n- <p id="status" role="status">Ready</p>\n+ <p class="status">Ready</p>\n\nkeyboard: FAIL · accessible name: PARTIAL · ${control}: REGRESSED`;
    question = "What should block approval?";
    correct = "Restore native button behavior and the live status relationship, then verify keyboard and name-role-value behavior.";
    wrongA = "Approve because the visible text and CSS class are unchanged.";
    wrongB = "Add a tabindex to the div; click and announcement semantics will then be identical.";
    explanation = "The diff removes native semantics and status communication. A tabindex cannot recreate button activation and live-region behavior by itself.";
  } else if (kind === "cost-report") {
    label = "Bundle and network report"; title = "Separate critical code from deferred code";
    evidence = `route,transfer_kb,parse_ms,critical\n/home,184,96,yes\n/dashboard,612,438,partly\n/editor,488,351,no\nshared-vendor,742,509,partly\n\ncache hit: 38% · duplicate modules: 146 KB · control: ${control}`;
    question = "Which first action is best supported by the report?";
    correct = "Inspect duplicate shared modules and move editor-only code behind its route boundary, then compare user metrics.";
    wrongA = "Remove all dependencies because the shared bundle is the largest row.";
    wrongB = "Compress images first even though this report identifies JavaScript parse and duplication costs.";
    explanation = "The evidence points to duplicated modules and non-critical editor code. A bounded split should be verified against loading and interaction metrics.";
  }
  evidence = `lesson ${lesson.id} · ${lesson.title}\n${evidence}`;
  const source = [correct, wrongA, wrongB] as const;
  const shift = (lesson.id + offsets[paceId]) % source.length;
  const options = source.map((_, index) => source[(index + shift) % source.length]) as [string, string, string];
  return { kind, label, title, briefing: `Investigate the browser evidence for ${lesson.title} before proposing a change.`, evidence, question, options, answer: options.indexOf(correct), explanation };
}
