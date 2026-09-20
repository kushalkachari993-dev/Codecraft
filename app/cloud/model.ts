export type CloudPlan = Record<string, unknown>;
export type CloudPlanFormat = "json" | "hcl" | "yaml";
export type CloudField = { key: string; type: "string" | "number" | "boolean" | "strings"; help: string };
export type CloudCheck = { name: string; hint: string; test: (plan: CloudPlan) => boolean };
export type CloudLesson = {
  id: number;
  title: string;
  minutes: number;
  objective: string;
  story: string;
  concepts: Array<{ title: string; body: string }>;
  exampleLabel?: string;
  example: string;
  exampleNote: string;
  mistake: string;
  practice?: { prompt: string; deliverable: string; success: string };
  projectStages?: Array<{ title: string; brief: string; evidence: string }>;
  mission: string;
  fields: CloudField[];
  starter: CloudPlan;
  solution: CloudPlan;
  checks: CloudCheck[];
  observations: (plan: CloudPlan) => string[];
  source: { label: string; url: string };
};
export type CloudResult = {
  passed: boolean;
  error?: string;
  plan?: CloudPlan;
  checks: Array<{ name: string; passed: boolean; hint: string }>;
  observations: string[];
};

export const field = (key: string, type: CloudField["type"], help: string): CloudField => ({ key, type, help });
export const check = (name: string, hint: string, test: CloudCheck["test"]): CloudCheck => ({ name, hint, test });
export const equals = (key: string, expected: unknown) => (plan: CloudPlan) => plan[key] === expected;
export const between = (key: string, min: number, max: number) => (plan: CloudPlan) => typeof plan[key] === "number" && Number.isInteger(plan[key]) && Number(plan[key]) >= min && Number(plan[key]) <= max;
export const exactSet = (value: unknown, expected: string[]) => Array.isArray(value) && value.length === expected.length && expected.every((item) => value.includes(item));
export const pinnedImage = (value: unknown) => typeof value === "string" && /^relay-api:\d+\.\d+\.\d+$/.test(value);
export const architectureSource = { label: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" };
export const identitySource = { label: "AWS IAM security best practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" };
export const containerSource = { label: "Docker build best practices", url: "https://docs.docker.com/build/building/best-practices/" };

const protectedKeys = new Set(["__proto__", "prototype", "constructor"]);
const formatLabel = (format: CloudPlanFormat) => format === "hcl" ? "HCL" : format.toUpperCase();

function parsePlanValue(source: string, allowPlainText: boolean) {
  try {
    return JSON.parse(source);
  } catch {
    if (allowPlainText && /^[A-Za-z0-9_./:%@+ -]+$/.test(source)) return source;
    throw new Error(allowPlainText ? "Use a plain value or valid JSON-style quotes and arrays." : "Strings need double quotes; arrays use JSON-style square brackets.");
  }
}

function parseFlatPlan(source: string, format: Exclude<CloudPlanFormat, "json">): CloudPlan {
  const plan: CloudPlan = {};
  const separator = format === "hcl" ? /^([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(.+)$/ : /^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.+)$/;
  for (const [index, rawLine] of source.replace(/\r\n?/g, "\n").split("\n").entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || (format === "hcl" && line.startsWith("//"))) continue;
    if (rawLine !== line) throw new Error(`Line ${index + 1}: nested blocks are outside this training format.`);
    const match = line.match(separator);
    if (!match) throw new Error(`Line ${index + 1}: expected key ${format === "hcl" ? "=" : ":"} value.`);
    const [, key, value] = match;
    if (protectedKeys.has(key)) throw new Error(`Line ${index + 1}: protected key is not allowed.`);
    if (Object.hasOwn(plan, key)) throw new Error(`Line ${index + 1}: duplicate key ${key}.`);
    plan[key] = parsePlanValue(value.trim(), format === "yaml");
  }
  return plan;
}

export function parseCloudPlan(source: string, format: CloudPlanFormat = "json"): CloudPlan {
  if (source.length > 16_000) throw new Error("Keep the relay plan under 16,000 characters.");
  if (format !== "json") return parseFlatPlan(source, format);
  const parsed: unknown = JSON.parse(source);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Start with one object.");
  return parsed as CloudPlan;
}

export function serializeCloudPlan(plan: CloudPlan, format: CloudPlanFormat = "json") {
  if (format === "json") return JSON.stringify(plan, null, 2);
  const separator = format === "hcl" ? " = " : ": ";
  return Object.entries(plan).map(([key, value]) => key + separator + JSON.stringify(value)).join("\n");
}

// Relay plans are educational, flat configuration subsets—not deployable Terraform, YAML manifests, IAM policies, or live cloud commands.
export function evaluateCloudPlan(lesson: CloudLesson, source: string, format: CloudPlanFormat = "json"): CloudResult {
  const invalid = (error: string): CloudResult => ({ passed: false, error, checks: [], observations: [] });
  let plan: CloudPlan;
  try {
    plan = parseCloudPlan(source, format);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Check the plan syntax.";
    return invalid(`The plan is not valid ${formatLabel(format)}. ${reason}`);
  }
  const allowed = new Set(lesson.fields.map((entry) => entry.key));
  const unknown = Object.keys(plan).filter((key) => !allowed.has(key));
  if (unknown.length) return invalid(`Unknown field: ${unknown[0]}. Use the field guide below the editor.`);
  for (const entry of lesson.fields) {
    const value = plan[entry.key];
    if (!Object.hasOwn(plan, entry.key)) return invalid(`Missing field: ${entry.key}. Add it using the field guide.`);
    const valid = entry.type === "strings"
      ? Array.isArray(value) && value.length <= 12 && value.every((item) => typeof item === "string" && item.length <= 200)
      : entry.type === "number" ? typeof value === "number" && Number.isFinite(value)
        : typeof value === entry.type && (typeof value !== "string" || value.length <= 200);
    if (!valid) return invalid(`${entry.key} must be ${entry.type === "strings" ? "an array of short strings" : `a ${entry.type}`}.`);
  }
  const checks = lesson.checks.map((entry) => ({ name: entry.name, passed: entry.test(plan), hint: entry.hint }));
  return { passed: checks.length > 0 && checks.every((entry) => entry.passed), plan, checks, observations: lesson.observations(plan) };
}

export function simulateCapacity(minimum: unknown, maximum: unknown, demand: number) {
  const valid = typeof minimum === "number" && typeof maximum === "number" && Number.isInteger(minimum) && Number.isInteger(maximum) && minimum >= 1 && maximum >= minimum && maximum <= 20;
  if (!valid) return { replicas: 0, served: 0, dropped: demand, credits: 0, valid: false };
  const replicas = Math.max(minimum, Math.min(maximum, Math.ceil(demand / 100)));
  const served = Math.min(demand, replicas * 100);
  return { replicas, served, dropped: demand - served, credits: 40 + replicas * 25, valid: true };
}
