import type { CloudArtifact, CloudArtifactCheck, CloudArtifactResult } from "../cloud/artifacts";
import type { CloudLesson } from "../cloud/model";
import type { DataPaceId } from "./track";

const MAX = 24_000;
const c = (name: string, hint: string, test: (source: string) => boolean): CloudArtifactCheck => ({ name, hint, test });
const slug = (lesson: CloudLesson) => lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 38);

function sqlArtifact(lesson: CloudLesson): CloudArtifact {
  const name = slug(lesson); const starter = `-- ${lesson.title}\nCREATE TABLE ${name} (\n  record_id text,\n  event_time text,\n  amount numeric\n);\nINSERT INTO analytics.${name} SELECT * FROM staging.${name};`;
  const solution = `-- ${lesson.title}\nCREATE TABLE IF NOT EXISTS analytics.${name} (\n  record_id text NOT NULL,\n  event_time timestamptz NOT NULL,\n  amount numeric CHECK (amount >= 0),\n  source_run_id text NOT NULL,\n  PRIMARY KEY (record_id)\n);\nMERGE INTO analytics.${name} AS target\nUSING staging.${name} AS source ON target.record_id = source.record_id\nWHEN MATCHED THEN UPDATE SET event_time = source.event_time, amount = source.amount, source_run_id = source.source_run_id\nWHEN NOT MATCHED THEN INSERT (record_id, event_time, amount, source_run_id) VALUES (source.record_id, source.event_time, source.amount, source.source_run_id);`;
  return { kind: "terraform", label: "SQL model and load", filename: "model.sql", language: "SQL", brief: `Repair the schema and replay-safe load for ${lesson.title}. Static checks inspect text only and never contact a database.`, starter, solution, checks: [c("Required identity and time", "Make record_id and event_time NOT NULL.", s => /record_id\s+text\s+NOT NULL/i.test(s) && /event_time\s+timestamptz\s+NOT NULL/i.test(s)), c("Stable primary key", "Declare record_id as the primary key.", s => /PRIMARY KEY\s*\(record_id\)/i.test(s)), c("Domain constraint", "Reject negative amount values.", s => /CHECK\s*\(amount\s*>=\s*0\)/i.test(s)), c("Replay-safe merge", "Use MERGE on record_id instead of append-only INSERT SELECT.", s => /MERGE INTO/i.test(s) && /ON target\.record_id\s*=\s*source\.record_id/i.test(s))] };
}

function workflowArtifact(lesson: CloudLesson): CloudArtifact {
  const name = slug(lesson); const starter = `pipeline: ${name}\nschedule: daily\ntasks:\n  publish:\n    command: transform-and-publish\n    retries: 8`;
  const solution = `pipeline: ${name}\nschedule: "0 4 * * *"\ntimezone: UTC\nmax_active_runs: 1\ntasks:\n  extract:\n    output: immutable/run_id\n    timeout_minutes: 30\n    retries: 2\n  quality:\n    needs: [extract]\n    checks: [row_count, schema, uniqueness]\n  publish:\n    needs: [quality]\n    mode: atomic_replace\n    replay_key: run_id`;
  return { kind: "cicd", label: "Pipeline workflow", filename: "pipeline.yml", language: "YAML", brief: `Repair a nested workflow for ${lesson.title}. The validator never invokes an orchestrator or command.`, starter, solution, checks: [c("Bounded schedule context", "Declare UTC and one active run.", s => /timezone:\s*UTC/.test(s) && /max_active_runs:\s*1/.test(s)), c("Dependencies are explicit", "Make quality depend on extract and publish depend on quality.", s => /quality:[\s\S]*needs:\s*\[extract\]/.test(s) && /publish:[\s\S]*needs:\s*\[quality\]/.test(s)), c("Quality gate is layered", "Check volume, schema, and uniqueness.", s => /checks:\s*\[row_count, schema, uniqueness\]/.test(s)), c("Publication is replay-safe", "Use atomic replacement and a run_id replay key.", s => /mode:\s*atomic_replace/.test(s) && /replay_key:\s*run_id/.test(s))] };
}

function contractArtifact(lesson: CloudLesson): CloudArtifact {
  const starter = JSON.stringify({ name: slug(lesson), version: 1, owner: "unknown", fields: [{ name: "record_id", type: "string", required: false }], compatibility: "none" }, null, 2);
  const solution = JSON.stringify({ name: slug(lesson), version: 2, owner: "data-platform", grain: "one record per record_id", fields: [{ name: "record_id", type: "string", required: true, classification: "internal" }, { name: "event_time", type: "timestamp_utc", required: true, classification: "internal" }], compatibility: "backward", quality: ["unique_record_id", "non_null_event_time"], retention_days: 365 }, null, 2);
  return { kind: "iam", label: "Dataset contract", filename: "contract.json", language: "JSON", brief: `Harden the ownership, grain, compatibility, and field contract for ${lesson.title}. Validation is local JSON inspection.`, starter, solution, checks: [c("Named owner and grain", "Add a responsible owner and explicit record grain.", s => { try { const x = JSON.parse(s); return x.owner === "data-platform" && typeof x.grain === "string"; } catch { return false; } }), c("Required identity and event time", "Require record_id and event_time.", s => { try { const f = JSON.parse(s).fields; return ["record_id", "event_time"].every(n => f.some((x: { name?: string; required?: boolean }) => x.name === n && x.required)); } catch { return false; } }), c("Compatibility is declared", "Use backward compatibility for this evolution.", s => { try { return JSON.parse(s).compatibility === "backward"; } catch { return false; } }), c("Quality and retention are explicit", "Add uniqueness, non-null time, and bounded retention.", s => { try { const x = JSON.parse(s); return x.quality?.includes("unique_record_id") && x.quality?.includes("non_null_event_time") && x.retention_days === 365; } catch { return false; } })] };
}

function transformArtifact(lesson: CloudLesson): CloudArtifact {
  const starter = `# ${lesson.title}\ndef transform(rows):\n    return [{**row, "amount": float(row["amount"])} for row in rows]`;
  const solution = `# ${lesson.title}\nfrom decimal import Decimal, InvalidOperation\n\ndef transform(rows, run_id):\n    accepted, rejected = [], []\n    for row in rows:\n        try:\n            record_id = str(row["record_id"]).strip()\n            if not record_id:\n                raise ValueError("missing record_id")\n            amount = Decimal(str(row["amount"]))\n            if amount < 0:\n                raise ValueError("negative amount")\n            accepted.append({**row, "record_id": record_id, "amount": str(amount), "source_run_id": run_id})\n        except (KeyError, InvalidOperation, ValueError) as error:\n            rejected.append({"row": row, "reason": str(error), "source_run_id": run_id})\n    return {"accepted": accepted, "rejected": rejected, "input_count": len(rows)}`;
  return { kind: "kubernetes", label: "Python transform", filename: "transform.py", language: "Python", brief: `Repair deterministic record handling for ${lesson.title}. Code remains inert text and is never executed.`, starter, solution, checks: [c("Exact numeric conversion", "Use Decimal instead of binary float for the amount.", s => /Decimal\(str\(row\["amount"\]\)\)/.test(s)), c("Identity is validated", "Reject missing record_id values.", s => /missing record_id/.test(s)), c("Rejected rows retain reasons", "Return rejected rows with a reason and run id.", s => /"rejected"/.test(s) && /"reason"/.test(s) && /source_run_id/.test(s)), c("Reconciliation count is returned", "Return input_count with accepted and rejected collections.", s => /"input_count"\s*:\s*len\(rows\)/.test(s) && /"accepted"/.test(s))] };
}

export function getDataArtifact(paceId: DataPaceId, lesson: CloudLesson): CloudArtifact {
  const offset = paceId === "expert" ? 2 : paceId === "intermediate" ? 1 : 0; const kind = (lesson.id - 1 + offset) % 4;
  return kind === 0 ? sqlArtifact(lesson) : kind === 1 ? workflowArtifact(lesson) : kind === 2 ? contractArtifact(lesson) : transformArtifact(lesson);
}
export function evaluateDataArtifact(artifact: CloudArtifact, source: string): CloudArtifactResult {
  if (!source.trim()) return { passed: false, error: "The artifact is empty.", checks: [] };
  if (source.length > MAX) return { passed: false, error: "Keep the training artifact under 24,000 characters.", checks: [] };
  if (source.includes("\0")) return { passed: false, error: "Null bytes are not allowed.", checks: [] };
  if (artifact.filename.endsWith(".json")) { try { JSON.parse(source); } catch { return { passed: false, error: "The contract must be valid JSON.", checks: [] }; } }
  const checks = artifact.checks.map((entry) => ({ name: entry.name, hint: entry.hint, passed: entry.test(source) }));
  return { passed: checks.every((entry) => entry.passed), checks };
}
