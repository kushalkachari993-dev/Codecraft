import { evaluateCloudArtifact, getCloudArtifact, type CloudArtifact, type CloudArtifactResult } from "../cloud/artifacts";
import type { CloudLesson } from "../cloud/model";
import { SECURITY_TOPICS } from "./curriculum";
import type { SecurityPaceId } from "./track";

const MAX = 24_000;
function reviewArtifact(paceId: SecurityPaceId, lesson: CloudLesson): CloudArtifact {
  const topic = SECURITY_TOPICS[paceId][lesson.id - 1];
  const make = (secure: boolean) => JSON.stringify({
    scenario: { track: "security", pace: paceId, lesson: lesson.title, fictional: true },
    boundary: {
      allowed: secure ? topic.allow : topic.deny,
      denied: secure ? topic.deny : topic.allow,
      default_decision: secure ? "deny" : "allow",
    },
    defense: { controls: secure ? topic.controls : [topic.controls[0]], signal: secure ? topic.signal : "status_ok", secrets_in_log: !secure },
    tests: { permitted_path: secure, denied_path: secure, recovery_drill: secure },
  }, null, 2);
  const checks = [
    { name: "The legitimate journey is preserved", hint: `Allow ${topic.allow}.`, test: (source: string) => parse(source)?.boundary?.allowed === topic.allow && parse(source)?.tests?.permitted_path === true },
    { name: "The unsafe journey is denied by default", hint: `Deny ${topic.deny}, including unknown requests.`, test: (source: string) => parse(source)?.boundary?.denied === topic.deny && parse(source)?.boundary?.default_decision === "deny" && parse(source)?.tests?.denied_path === true },
    { name: "Independent controls protect the boundary", hint: `Include ${topic.controls.join(", ")}.`, test: (source: string) => { const controls = parse(source)?.defense?.controls; return Array.isArray(controls) && controls.length === topic.controls.length && topic.controls.every((control) => controls.includes(control)); } },
    { name: "Evidence is useful without secret values", hint: `Record ${topic.signal}; do not log secrets.`, test: (source: string) => parse(source)?.defense?.signal === topic.signal && parse(source)?.defense?.secrets_in_log === false },
    { name: "Recovery is tested", hint: "Set recovery_drill to true after checking the restored user journey.", test: (source: string) => parse(source)?.tests?.recovery_drill === true },
  ];
  return { kind: "iam", label: "Security boundary review", filename: "security-review.json", language: "JSON", brief: `Review the nested policy and test evidence for ${lesson.title}. This fictional document is validated locally; no service or target is contacted.`, starter: make(false), solution: make(true), checks };
}

type ReviewDocument = {
  boundary?: { allowed?: unknown; denied?: unknown; default_decision?: unknown };
  defense?: { controls?: unknown; signal?: unknown; secrets_in_log?: unknown };
  tests?: { permitted_path?: unknown; denied_path?: unknown; recovery_drill?: unknown };
};
function parse(source: string): ReviewDocument | null {
  try {
    const value: unknown = JSON.parse(source);
    return value && typeof value === "object" && !Array.isArray(value) ? value as ReviewDocument : null;
  } catch { return null; }
}

export function getSecurityArtifact(paceId: SecurityPaceId, lesson: CloudLesson): CloudArtifact {
  const title = lesson.title;
  if (paceId !== "beginner") {
    const trainingId = /IAM|role|identity|Key and secret/.test(title) ? 8
      : /Container|Kubernetes|runtime controls/.test(title) ? 7
        : /Infrastructure|deployment|shared platform/.test(title) ? 6
          : /CI\/CD|pipeline|release|Build trust|supply chain|Trusted Pipeline/.test(title) ? 12 : 0;
    if (trainingId) return getCloudArtifact("beginner", { ...lesson, id: trainingId });
  }
  return reviewArtifact(paceId, lesson);
}

export function evaluateSecurityArtifact(artifact: CloudArtifact, source: string): CloudArtifactResult {
  if (artifact.filename !== "security-review.json") return evaluateCloudArtifact(artifact, source);
  if (!source.trim()) return { passed: false, error: "The security review is empty.", checks: [] };
  if (source.length > MAX || source.includes("\0")) return { passed: false, error: "Keep the review under 24,000 characters and remove null bytes.", checks: [] };
  if (!parse(source)) return { passed: false, error: "The security review must be one valid JSON object.", checks: [] };
  const checks = artifact.checks.map((entry) => ({ name: entry.name, hint: entry.hint, passed: entry.test(source) }));
  return { passed: checks.length > 0 && checks.every((entry) => entry.passed), checks };
}
