import { check, exactSet, field, type CloudLesson, type CloudPlan } from "../cloud/model";
import { BEGINNER_SECURITY } from "./curriculum-beginner";
import { INTERMEDIATE_SECURITY } from "./curriculum-intermediate";
import { EXPERT_SECURITY } from "./curriculum-expert";
import { getSecurityWorlds, type SecurityPaceId } from "./track";
import type { SecuritySource, SecurityTopic } from "./topic";

const SOURCES: Record<SecuritySource, CloudLesson["source"]> = {
  web: { label: "OWASP Top 10:2025", url: "https://top10.owasp.org/2025/0x00_2025-Introduction/" },
  identity: { label: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
  cloud: { label: "AWS IAM security best practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
  delivery: { label: "GitHub Actions security guidance", url: "https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions" },
  incident: { label: "NIST incident response guidance", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
  ai: { label: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
  architecture: { label: "NIST Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework" },
};

function buildLesson(spec: SecurityTopic, id: number, paceId: SecurityPaceId, topics: SecurityTopic[]): CloudLesson {
  const project = getSecurityWorlds(paceId).some((world) => world.end === id);
  const start = id === 21 ? 16 : id <= 5 ? 1 : id <= 10 ? 6 : 11;
  const worldTopics = topics.slice(start - 1, id);
  const solution: CloudPlan = { allowed_behavior: spec.allow, blocked_behavior: spec.deny, controls: [...spec.controls], evidence_signal: spec.signal, recovery_ready: true };
  const starter: CloudPlan = { allowed_behavior: spec.deny, blocked_behavior: spec.allow, controls: [spec.controls[0]], evidence_signal: "green dashboard", recovery_ready: false };
  return {
    id, title: spec.title, minutes: project ? 30 : paceId === "beginner" ? 16 : paceId === "intermediate" ? 20 : 24,
    objective: spec.goal,
    story: `Byte is reviewing the fictional Relay service. Its current design permits ${spec.deny} while disrupting ${spec.allow}. Trace the boundary before changing the policy.`,
    concepts: [
      { title: "What happens at this boundary", body: spec.mechanism },
      { title: "Make the defensive decision", body: spec.decision },
      { title: "Where the design can fail", body: spec.failure },
      { title: "Prove both sides", body: `A useful review demonstrates that ${spec.allow} succeeds and ${spec.deny} is refused. Observe ${spec.signal}; then test the recovery path as well. A passing configuration alone does not prove that users can complete their task or that a denied request stays denied.` },
    ],
    exampleLabel: "FICTIONAL SECURITY CASE",
    example: `${spec.example}\n\nReason through the case: ${spec.mechanism} The safe decision is to permit ${spec.allow}, refuse ${spec.deny}, and verify the difference with ${spec.signal}. If the evidence does not distinguish those two outcomes, do not claim that the boundary is secure.`,
    exampleNote: `Work from the request and its trust boundary: ${spec.decision}`,
    mistake: spec.failure,
    practice: { prompt: `Explain which actor crosses the boundary in this case, why ${spec.deny} must fail, and how the legitimate ${spec.allow} path remains available.`, deliverable: "An allowed request, a denied request, and the security decision that separates them.", success: `The ${spec.signal} evidence agrees with both request outcomes and does not expose secret values.` },
    projectStages: project ? [
      { title: "Map the system", brief: `Combine ${worldTopics[0].title} and ${worldTopics[1].title}. State the asset, actor, and trust boundary before choosing controls.`, evidence: "A compact threat model with assumptions and one rejected design." },
      { title: "Repair the control", brief: `Apply ${worldTopics[2].title} and ${worldTopics[3].title} to the supplied plan and nested artifact.`, evidence: "A changed artifact with a reason for each control." },
      { title: "Test allowed and denied paths", brief: `Show that ${spec.allow} still works while ${spec.deny} fails. Include a boundary case.`, evidence: "Positive, negative, and failure test results." },
      { title: "Investigate and present", brief: `Use ${spec.signal} to explain what the evidence proves, what remains uncertain, and how to recover.`, evidence: "Incident timeline, residual risk, and a concise reviewer summary." },
    ] : undefined,
    mission: `Review the Relay policy. Permit ${spec.allow}; block ${spec.deny}; apply ${spec.controls.join(", ")}; watch ${spec.signal}; and keep a recovery path. All names and evidence are fictional.`,
    fields: [
      field("allowed_behavior", "string", `Legitimate activity: ${spec.allow}.`),
      field("blocked_behavior", "string", `Activity that must be refused: ${spec.deny}.`),
      field("controls", "strings", `Three independent controls: ${spec.controls.join(", ")}.`),
      field("evidence_signal", "string", `Signal used to verify behavior: ${spec.signal}.`),
      field("recovery_ready", "boolean", "Whether a bounded recovery path has been planned and tested."),
    ],
    starter, solution,
    checks: [
      check("Legitimate path remains available", `Set allowed_behavior to ${spec.allow}.`, (plan) => plan.allowed_behavior === spec.allow),
      check("Unsafe path is explicitly denied", `Set blocked_behavior to ${spec.deny}.`, (plan) => plan.blocked_behavior === spec.deny),
      check("Independent controls are present", `Include ${spec.controls.join(", ")} once each.`, (plan) => exactSet(plan.controls, spec.controls)),
      check("Evidence and recovery are declared", `Use ${spec.signal} and a tested recovery path.`, (plan) => plan.evidence_signal === spec.signal && plan.recovery_ready === true),
    ],
    observations: (plan) => [
      `Legitimate path: ${plan.allowed_behavior === spec.allow ? "available" : "blocked or unverified"}.`,
      `Unsafe path: ${plan.blocked_behavior === spec.deny ? "denied" : "exposed or unverified"}.`,
      `Control coverage: ${spec.controls.filter((control) => Array.isArray(plan.controls) && plan.controls.includes(control)).length}/3; evidence: ${plan.evidence_signal === spec.signal ? "aligned" : "not aligned"}.`,
    ],
    source: SOURCES[spec.source],
  };
}

export const SECURITY_TOPICS: Record<SecurityPaceId, SecurityTopic[]> = { beginner: BEGINNER_SECURITY, intermediate: INTERMEDIATE_SECURITY, expert: EXPERT_SECURITY };
export const SECURITY_CURRICULA: Record<SecurityPaceId, CloudLesson[]> = {
  beginner: BEGINNER_SECURITY.map((spec, index) => buildLesson(spec, index + 1, "beginner", BEGINNER_SECURITY)),
  intermediate: INTERMEDIATE_SECURITY.map((spec, index) => buildLesson(spec, index + 1, "intermediate", INTERMEDIATE_SECURITY)),
  expert: EXPERT_SECURITY.map((spec, index) => buildLesson(spec, index + 1, "expert", EXPERT_SECURITY)),
};
export const getSecurityLessons = (paceId: SecurityPaceId) => SECURITY_CURRICULA[paceId];
export const getSecurityLesson = (paceId: SecurityPaceId, id: number) => getSecurityLessons(paceId).find((lesson) => lesson.id === id);
