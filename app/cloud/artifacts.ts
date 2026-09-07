import type { CloudLesson } from "./model";
import type { CloudPaceId } from "./track";

export type CloudArtifactKind = "terraform" | "kubernetes" | "iam" | "cicd";
export type CloudArtifactCheck = { name: string; hint: string; test: (source: string) => boolean };
export type CloudArtifact = {
  kind: CloudArtifactKind;
  label: string;
  filename: string;
  language: string;
  brief: string;
  starter: string;
  solution: string;
  checks: CloudArtifactCheck[];
};
export type CloudArtifactResult = {
  passed: boolean;
  error?: string;
  checks: Array<{ name: string; passed: boolean; hint: string }>;
};

const MAX_ARTIFACT_LENGTH = 24_000;
const DIGEST = "4f".repeat(32);
const artifactKindsByPace: Record<CloudPaceId, CloudArtifactKind[]> = {
  beginner: [
    "iam", "terraform", "kubernetes", "terraform", "terraform", "terraform", "kubernetes",
    "iam", "iam", "terraform", "kubernetes", "cicd", "kubernetes", "kubernetes", "cicd",
    "terraform", "terraform", "terraform", "terraform", "cicd", "cicd",
  ],
  intermediate: [
    "terraform", "terraform", "terraform", "cicd", "terraform", "cicd", "cicd",
    "kubernetes", "kubernetes", "cicd", "kubernetes", "kubernetes", "kubernetes", "terraform",
    "cicd", "terraform", "cicd", "kubernetes", "iam", "cicd", "cicd",
  ],
  expert: [
    "terraform", "terraform", "terraform", "terraform", "terraform", "iam", "iam", "iam",
    "cicd", "iam", "terraform", "kubernetes", "cicd", "terraform", "cicd", "iam", "iam",
    "terraform", "cicd", "cicd", "terraform",
  ],
};

const artifactCheck = (name: string, hint: string, test: (source: string) => boolean): CloudArtifactCheck => ({ name, hint, test });
const block = (source: string, name: string) => new RegExp("(?:^|\\n)\\s*" + name + "(?:\\s+\\\"[^\\\"]+\\\")*\\s*\\{", "m").test(source);
const lessonSlug = (lesson: CloudLesson) => lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || `lesson-${lesson.id}`;
const lessonContract = (lesson: CloudLesson, plan: Record<string, unknown>) => Object.keys(lesson.solution).map((key) => `    ${key} = ${JSON.stringify(plan[key])}`).join("\n");
const readJson = (source: string): Record<string, unknown> | null => {
  try {
    const value: unknown = JSON.parse(source);
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
};

function hasBalancedBraces(source: string) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (const character of source) {
    if (escaped) { escaped = false; continue; }
    if (character === "\\" && quoted) { escaped = true; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (quoted) continue;
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0 && !quoted;
}

function terraformArtifact(lesson: CloudLesson): CloudArtifact {
  const title = lesson.title.replace(/[^A-Za-z0-9 ._-]/g, "");
  const slug = lessonSlug(lesson);
  const render = (secure: boolean, plan: Record<string, unknown>) => `# ${title} · ${secure ? "statically verified training artifact" : "injected review failure"}
terraform {
  required_version = ">= 1.6.0"
  backend "s3" {
    bucket       = "codecraft-relay-state"
    key          = "training/${slug}.tfstate"
    region       = "eu-west-1"
    encrypt      = ${secure}
    use_lockfile = ${secure}
  }
}

locals {
  lesson_controls = {
${lessonContract(lesson, plan)}
  }
}

module "relay_control" {
  source      = "app.terraform.io/codecraft/relay-control/aws"
  version     = "${secure ? "1.4.0" : "main"}"
  environment = "training"
  control_id  = "${slug}"
}`;
  const starter = render(false, lesson.starter);
  const solution = render(true, lesson.solution);
  return {
    kind: "terraform", label: "Terraform plan", filename: "main.tf", language: "HCL",
    brief: `Review the nested infrastructure contract for ${lesson.title}. The scanner checks state protection and module provenance without running Terraform.`,
    starter, solution,
    checks: [
      artifactCheck("The document contains real nested Terraform blocks", "Keep the terraform backend and module blocks intact.", (source) => block(source, "terraform") && block(source, "backend") && block(source, "module")),
      artifactCheck("Remote state is encrypted", "Set encrypt = true in the remote backend.", (source) => /\bencrypt\s*=\s*true\b/.test(source)),
      artifactCheck("Concurrent state writes are locked", "Enable the backend lock with use_lockfile = true.", (source) => /\buse_lockfile\s*=\s*true\b/.test(source)),
      artifactCheck("The module contract is version-pinned", "Use a semantic module version such as 1.4.0 instead of a branch.", (source) => /\bversion\s*=\s*"\d+\.\d+\.\d+"/.test(source)),
      artifactCheck("The lesson architecture contract is preserved", `Set the lesson_controls map to the verified ${lesson.title} values.`, (source) => Object.keys(lesson.solution).every((key) => source.includes(`${key} = ${JSON.stringify(lesson.solution[key])}`))),
    ],
  };
}

function kubernetesArtifact(lesson: CloudLesson): CloudArtifact {
  const slug = lessonSlug(lesson);
  const starter = `# ${lesson.title} · injected review failure
apiVersion: apps/v1
kind: Deployment
metadata:
  name: relay-api
  labels:
    app: relay-api
    codecraft.dev/lesson: ${slug}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: relay-api
  template:
    metadata:
      labels:
        app: relay-api
    spec:
      securityContext:
        runAsNonRoot: false
      containers:
        - name: api
          image: ghcr.io/codecraft/relay:latest
          securityContext:
            privileged: true`;
  const solution = `# ${lesson.title} · statically verified training artifact
apiVersion: apps/v1
kind: Deployment
metadata:
  name: relay-api
  labels:
    app: relay-api
    codecraft.dev/lesson: ${slug}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: relay-api
  template:
    metadata:
      labels:
        app: relay-api
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: api
          image: ghcr.io/codecraft/relay@sha256:${DIGEST}
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080`;
  return {
    kind: "kubernetes", label: "Kubernetes workload", filename: "deployment.yaml", language: "YAML",
    brief: `Harden a realistic nested Deployment for ${lesson.title}. The exercise parses nothing beyond a safe text model and never contacts a cluster.`,
    starter, solution,
    checks: [
      artifactCheck("The workload keeps more than one replica", "Set replicas to at least 2.", (source) => Number(source.match(/\breplicas:\s*(\d+)/)?.[1] ?? 0) >= 2),
      artifactCheck("The image is immutable", "Replace the mutable tag with an image digest.", (source) => /\bimage:\s*\S+@sha256:[a-f\d]{64}\b/i.test(source)),
      artifactCheck("The container runs with reduced privilege", "Require non-root execution and disable privilege escalation.", (source) => /\brunAsNonRoot:\s*true\b/.test(source) && /\ballowPrivilegeEscalation:\s*false\b/.test(source) && !/\bprivileged:\s*true\b/.test(source)),
      artifactCheck("Scheduling and readiness contracts are declared", "Add resource requests, limits, and a readiness probe.", (source) => /\bresources:\s*\n/.test(source) && /\brequests:\s*\n/.test(source) && /\blimits:\s*\n/.test(source) && /\breadinessProbe:\s*\n/.test(source)),
      artifactCheck("The workload is bound to this lesson review", `Keep the codecraft.dev/lesson label set to ${slug}.`, (source) => source.includes(`codecraft.dev/lesson: ${slug}`)),
    ],
  };
}

function iamStatements(source: string) {
  const document = readJson(source);
  const statements = document?.Statement;
  return Array.isArray(statements) ? statements.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
}

function iamArtifact(lesson: CloudLesson): CloudArtifact {
  const slug = lessonSlug(lesson);
  const starter = JSON.stringify({
    Version: "2012-10-17",
    Statement: [{ Sid: "RelayAccess", Effect: "Allow", Action: "*", Resource: "*" }],
  }, null, 2);
  const solution = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      { Sid: "ReadRelayEvidence", Effect: "Allow", Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::codecraft-relay-evidence/${slug}/*`] },
      { Sid: "RequireTLS", Effect: "Deny", Action: "s3:*", Resource: ["arn:aws:s3:::codecraft-relay-evidence", `arn:aws:s3:::codecraft-relay-evidence/${slug}/*`], Condition: { Bool: { "aws:SecureTransport": "false" } } },
    ],
  }, null, 2);
  return {
    kind: "iam", label: "IAM policy", filename: "relay-policy.json", language: "JSON",
    brief: `Reduce the policy blast radius for ${lesson.title}. Validation is local JSON inspection; no identity or cloud credentials are used.`,
    starter, solution,
    checks: [
      artifactCheck("The policy uses the current language version", "Keep Version set to 2012-10-17.", (source) => readJson(source)?.Version === "2012-10-17"),
      artifactCheck("Allowed actions are least-privileged", "Replace wildcard Allow actions with the exact read action.", (source) => iamStatements(source).some((entry) => entry.Effect === "Allow" && (Array.isArray(entry.Action) ? entry.Action.includes("s3:GetObject") : entry.Action === "s3:GetObject")) && !iamStatements(source).some((entry) => entry.Effect === "Allow" && (entry.Action === "*" || (Array.isArray(entry.Action) && entry.Action.includes("*"))))),
      artifactCheck("Allowed resources are concrete", "Scope Allow statements to the evidence object ARN.", (source) => iamStatements(source).filter((entry) => entry.Effect === "Allow").every((entry) => entry.Resource !== "*" && (!Array.isArray(entry.Resource) || !entry.Resource.includes("*"))) && iamStatements(source).some((entry) => JSON.stringify(entry.Resource).includes("codecraft-relay-evidence"))),
      artifactCheck("Unencrypted transport is explicitly denied", "Add a Deny statement for aws:SecureTransport false.", (source) => iamStatements(source).some((entry) => entry.Effect === "Deny" && JSON.stringify(entry.Condition).includes("aws:SecureTransport") && JSON.stringify(entry.Condition).includes("false"))),
      artifactCheck("The resource matches this lesson boundary", `Scope the object path to ${slug}.`, (source) => source.includes(`/codecraft-relay-evidence/${slug}/`) || source.includes(`codecraft-relay-evidence/${slug}/`)),
    ],
  };
}

function cicdArtifact(lesson: CloudLesson): CloudArtifact {
  const slug = lessonSlug(lesson);
  const starter = `# ${lesson.title} · injected review failure
name: ${JSON.stringify(lesson.title + " review")}
on:
  push:
    branches: [main]
permissions: write-all
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh
        env:
          CONTROL_ID: ${slug}
          CLOUD_ACCESS_KEY: stored-long-lived-key`;
  const solution = `# ${lesson.title} · statically verified training artifact
name: ${JSON.stringify(lesson.title + " review")}
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - run: npm test
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/build-once.sh
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    permissions:
      id-token: write
      contents: read
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/deploy-digest.sh
        env:
          CONTROL_ID: ${slug}`;
  return {
    kind: "cicd", label: "CI/CD workflow", filename: "relay-release.yml", language: "YAML",
    brief: `Repair the delivery evidence chain for ${lesson.title}. Static checks inspect workflow structure only; no commands or actions are executed.`,
    starter, solution,
    checks: [
      artifactCheck("Default workflow permissions are read-only", "Replace write-all with an explicit contents: read default.", (source) => !/\bpermissions:\s*write-all\b/.test(source) && /\bpermissions:\s*\n\s+contents:\s*read\b/.test(source)),
      artifactCheck("Testing, building, and deployment are ordered", "Make build depend on test and deploy depend on build.", (source) => /\bbuild:\s*[\s\S]*?\bneeds:\s*test\b/.test(source) && /\bdeploy:\s*[\s\S]*?\bneeds:\s*build\b/.test(source)),
      artifactCheck("Deployment uses short-lived federation", "Grant id-token: write only to the deploy job and remove stored access keys.", (source) => /\bid-token:\s*write\b/.test(source) && !/CLOUD_ACCESS_KEY|stored-long-lived-key/.test(source)),
      artifactCheck("Production is a protected, pinned promotion", "Use a production environment, a main-branch condition, and a commit-pinned checkout action.", (source) => /\benvironment:\s*production\b/.test(source) && /github\.ref\s*==\s*['"]refs\/heads\/main['"]/.test(source) && /actions\/checkout@[a-f\d]{40}\b/i.test(source)),
      artifactCheck("The workflow verifies this lesson contract", `Keep CONTROL_ID set to ${slug}.`, (source) => new RegExp(`\\bCONTROL_ID:\\s*${slug}\\b`).test(source)),
    ],
  };
}

export function getCloudArtifact(paceId: CloudPaceId, lesson: CloudLesson): CloudArtifact {
  const kind = artifactKindsByPace[paceId][lesson.id - 1];
  if (!kind) throw new Error(`Missing Cloud artifact for ${paceId} lesson ${lesson.id}.`);
  if (kind === "kubernetes") return kubernetesArtifact(lesson);
  if (kind === "iam") return iamArtifact(lesson);
  if (kind === "cicd") return cicdArtifact(lesson);
  return terraformArtifact(lesson);
}

function syntaxError(artifact: CloudArtifact, source: string) {
  if (!source.trim()) return "The artifact is empty.";
  if (source.length > MAX_ARTIFACT_LENGTH) return `Keep the artifact under ${MAX_ARTIFACT_LENGTH.toLocaleString()} characters.`;
  if (source.includes("\0")) return "Null bytes are not allowed in training artifacts.";
  if (artifact.kind === "iam" && !readJson(source)) return "The IAM artifact must be one valid JSON object.";
  if (artifact.kind === "terraform" && !hasBalancedBraces(source)) return "The HCL artifact has an unbalanced block or quote.";
  if ((artifact.kind === "kubernetes" || artifact.kind === "cicd") && (/\t/.test(source) || !/^[A-Za-z][^\n]*:\s*.*$/m.test(source))) return "The YAML artifact needs colon-based keys and spaces instead of tabs.";
  return undefined;
}

export function evaluateCloudArtifact(artifact: CloudArtifact, source: string): CloudArtifactResult {
  const error = syntaxError(artifact, source);
  if (error) return { passed: false, error, checks: [] };
  const checks = artifact.checks.map((entry) => ({ name: entry.name, hint: entry.hint, passed: entry.test(source) }));
  return { passed: checks.length > 0 && checks.every((entry) => entry.passed), checks };
}
