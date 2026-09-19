"use client";

import { useState } from "react";
import LessonDepthPanel from "../components/lesson-depth-panel";
import { recordMissedQuestion } from "../learning-memory";
import { useLearningVisit } from "../hooks/use-learning-visit";
// Document navigation avoids the hosted router's broken lesson transitions.
import { DAILY_QUEST_XP } from "../daily-quest";
import { evaluateBackendArtifact, getBackendArtifact } from "../backend/artifacts";
import { getBackendCheckpoints } from "../backend/checkpoints";
import { getBackendEvidenceExercise } from "../backend/evidence";
import { backendLessonXp } from "../backend/progress";
import { BACKEND_PATH_TOTAL, getBackendPath, isBackendWorldProject } from "../backend/track";
import { evaluateFrontendArtifact, getFrontendArtifact } from "../frontend/artifacts";
import { getFrontendCheckpoints } from "../frontend/checkpoints";
import { getFrontendEvidenceExercise } from "../frontend/evidence";
import { frontendLessonXp } from "../frontend/progress";
import { FRONTEND_PATH_TOTAL, getFrontendPath, isFrontendWorldProject } from "../frontend/track";
import { evaluateCloudArtifact, getCloudArtifact, type CloudArtifactResult } from "./artifacts";
import { getCloudCheckpoints } from "./checkpoints";
import { getCloudEvidenceExercise } from "./evidence";
import { evaluateCloudPlan, parseCloudPlan, serializeCloudPlan, type CloudLesson, type CloudPlanFormat, type CloudResult } from "./model";
import { cloudLessonXp } from "./progress";
import { CLOUD_PATH_TOTAL, getCloudPath, isCloudWorldProject, type CloudPaceId } from "./track";

const lessonPath = (trackId: "cloud" | "backend" | "frontend", paceId: CloudPaceId, id: number) => "/lesson/" + trackId + "/" + paceId + "/" + id;
const FORMATS: CloudPlanFormat[] = ["json", "hcl", "yaml"];
const formatLabel = (format: CloudPlanFormat) => format === "hcl" ? "HCL" : format.toUpperCase();

export default function CloudLab({ paceId, lesson, completed, daily = false, trackKind = "cloud", onComplete }: {
  paceId: CloudPaceId; lesson: CloudLesson; completed: boolean; daily?: boolean; trackKind?: "cloud" | "backend" | "frontend"; onComplete: () => void;
}) {
  const backend = trackKind === "backend";
  const frontend = trackKind === "frontend";
  useLearningVisit(trackKind, paceId, lesson.id, lesson.title, !daily);
  const trackLabel = frontend ? "Frontend Web Development" : backend ? "Backend Engineering" : "Cloud Engineering";
  const trackShortLabel = frontend ? "Frontend" : backend ? "Backend" : "Cloud";
  const lessonTotal = frontend ? FRONTEND_PATH_TOTAL : backend ? BACKEND_PATH_TOTAL : CLOUD_PATH_TOTAL;
  const path = frontend ? getFrontendPath(paceId) : backend ? getBackendPath(paceId) : getCloudPath(paceId);
  const checkpoints = frontend ? getFrontendCheckpoints(paceId, lesson) : backend ? getBackendCheckpoints(paceId, lesson) : getCloudCheckpoints(paceId, lesson);
  const evidence = frontend ? getFrontendEvidenceExercise(paceId, lesson) : backend ? getBackendEvidenceExercise(paceId, lesson) : getCloudEvidenceExercise(paceId, lesson);
  const artifact = frontend ? getFrontendArtifact(paceId, lesson) : backend ? getBackendArtifact(paceId, lesson) : getCloudArtifact(paceId, lesson);
  const evaluateArtifact = frontend ? evaluateFrontendArtifact : backend ? evaluateBackendArtifact : evaluateCloudArtifact;
  const worldProject = frontend ? isFrontendWorldProject(paceId, lesson.id) : backend ? isBackendWorldProject(paceId, lesson.id) : isCloudWorldProject(paceId, lesson.id);
  const draftKey = (planFormat: CloudPlanFormat) => "codecraft-" + trackKind + "-draft-v2-" + paceId + "-" + lesson.id + "-" + planFormat;
  const artifactDraftKey = "codecraft-" + trackKind + "-artifact-v1-" + paceId + "-" + lesson.id + "-" + artifact.kind;
  const [format, setFormat] = useState<CloudPlanFormat>("json");
  const [code, setCode] = useState(() => {
    try {
      const draft = window.sessionStorage.getItem(draftKey("json"));
      return draft && draft.length <= 16_000 ? draft : serializeCloudPlan(lesson.starter);
    } catch { return serializeCloudPlan(lesson.starter); }
  });
  const [result, setResult] = useState<CloudResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [checkpointChoices, setCheckpointChoices] = useState<Array<number | null>>(() => checkpoints.map(() => null));
  const [checkpointResults, setCheckpointResults] = useState<Array<"idle" | "correct" | "incorrect">>(() => checkpoints.map(() => "idle"));
  const [evidenceChoice, setEvidenceChoice] = useState<number | null>(null);
  const [evidenceResult, setEvidenceResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const [artifactCode, setArtifactCode] = useState(() => {
    try {
      const draft = window.sessionStorage.getItem(artifactDraftKey);
      return draft && draft.length <= 24_000 ? draft : artifact.starter;
    } catch { return artifact.starter; }
  });
  const [artifactResult, setArtifactResult] = useState<CloudArtifactResult | null>(null);
  const [artifactAttempts, setArtifactAttempts] = useState(0);
  const [saveError, setSaveError] = useState("");
  const [draftWarning, setDraftWarning] = useState("");
  const [undoCode, setUndoCode] = useState<string | null>(null);
  const [newlyCompleted, setNewlyCompleted] = useState(false);
  const checkpointPassed = checkpointResults.every((entry) => entry === "correct");
  const evidencePassed = evidenceResult === "correct";
  const artifactPassed = artifactResult?.passed === true;

  const edit = (next: string) => {
    setCode(next);
    setResult(null);
    setSaveError("");
    try {
      window.sessionStorage.setItem(draftKey(format), next);
      setDraftWarning("");
    } catch { setDraftWarning("Draft storage is unavailable. Keep this tab open while you work."); }
  };
  const switchFormat = (nextFormat: CloudPlanFormat) => {
    if (nextFormat === format) return;
    try {
      const converted = serializeCloudPlan(parseCloudPlan(code, format), nextFormat);
      setFormat(nextFormat);
      setCode(converted);
      setResult(null);
      window.sessionStorage.setItem(draftKey(nextFormat), converted);
      setDraftWarning("");
    } catch {
      setDraftWarning("Fix the current syntax before converting it to another format.");
    }
  };
  const run = () => {
    setSaveError("");
    setAttempts((count) => count + 1);
    setResult(evaluateCloudPlan(lesson, code, format));
  };
  const formatCurrent = () => {
    try {
      edit(serializeCloudPlan(parseCloudPlan(code, format), format));
    } catch {
      run();
    }
  };
  const loadFailureScenario = () => {
    setUndoCode(code);
    edit(serializeCloudPlan(lesson.starter, format));
  };
  const chooseCheckpoint = (questionIndex: number, optionIndex: number) => {
    setCheckpointChoices((current) => current.map((entry, index) => index === questionIndex ? optionIndex : entry));
    setCheckpointResults((current) => current.map((entry, index) => index === questionIndex ? "idle" : entry));
    setSaveError("");
  };
  const checkKnowledge = (questionIndex: number) => {
    const correct = checkpointChoices[questionIndex] === checkpoints[questionIndex].answer;
    if (!correct && !recordMissedQuestion({ trackId: trackKind, paceId, lessonId: lesson.id, title: lesson.title }, checkpoints[questionIndex])) setDraftWarning("Review storage is unavailable in this browser.");
    setCheckpointResults((current) => current.map((entry, index) => index === questionIndex ? correct ? "correct" : "incorrect" : entry));
  };
  const checkEvidence = () => {
    const correct = evidenceChoice === evidence.answer;
    if (!correct && !recordMissedQuestion({ trackId: trackKind, paceId, lessonId: lesson.id, title: lesson.title }, evidence)) setDraftWarning("Review storage is unavailable in this browser.");
    setEvidenceResult(correct ? "correct" : "incorrect");
  };
  const editArtifact = (next: string) => {
    setArtifactCode(next);
    setArtifactResult(null);
    setSaveError("");
    try {
      window.sessionStorage.setItem(artifactDraftKey, next);
      setDraftWarning("");
    } catch { setDraftWarning("Draft storage is unavailable. Keep this tab open while you work."); }
  };
  const runArtifact = () => {
    setArtifactAttempts((count) => count + 1);
    setArtifactResult(evaluateArtifact(artifact, artifactCode));
  };
  const loadArtifactFailure = () => editArtifact(artifact.starter);
  const complete = () => {
    // Revalidate the current editor contents; a prior green run is never enough.
    if (!checkpointPassed) {
      setSaveError(`Pass all three ${frontend ? "interface" : "architecture"} decisions before completing this lesson.`);
      return;
    }
    if (!evidencePassed) {
      setSaveError("Resolve the evidence investigation before completing this lesson.");
      return;
    }
    const reviewedArtifact = evaluateArtifact(artifact, artifactCode);
    setArtifactResult(reviewedArtifact);
    if (!reviewedArtifact.passed) {
      setSaveError("Repair every static artifact check before completing this lesson.");
      return;
    }
    const checked = evaluateCloudPlan(lesson, code, format);
    setResult(checked);
    if (!checked.passed) return;
    try {
      onComplete();
      setNewlyCompleted(true);
      setSaveError("");
    } catch { setSaveError("Progress could not be saved. Allow browser storage, then try completing the lesson again. Your plan is still in the editor."); }
  };
  const download = () => {
    const checked = evaluateCloudPlan(lesson, code, format);
    const reviewedArtifact = evaluateArtifact(artifact, artifactCode);
    if (!checked.passed || !reviewedArtifact.passed) { setResult(checked); setArtifactResult(reviewedArtifact); return; }
    const report = { format: "CodeCraft " + trackShortLabel + " review bundle v3 — educational simulation only", sourceFormat: formatLabel(format), lesson: lesson.title, plan: checked.plan, checks: checked.checks.map(({ name, passed }) => ({ name, passed })), observations: checked.observations, evidenceExercise: evidence.label, artifact: { kind: artifact.kind, filename: artifact.filename, source: artifactCode, checks: reviewedArtifact.checks.map(({ name, passed }) => ({ name, passed })) }, warning: frontend ? "Static frontend training output only. No artifact was executed, published, or sent to an external service." : backend ? "Static backend training output only. No service, database, queue, or external API was contacted." : "Static training output only. No infrastructure was created, no credentials were used, and costs are fictional." };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codecraft-" + trackKind + "-review.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const rewardXp = daily ? DAILY_QUEST_XP : frontend ? frontendLessonXp(lesson.id, paceId) : backend ? backendLessonXp(lesson.id, paceId) : cloudLessonXp(lesson.id, paceId);
  const canComplete = result?.passed === true && checkpointPassed && evidencePassed && artifactPassed;

  return (
    <>
      <nav className="curriculum-steps cloud-lesson-steps" aria-label="Lesson sections">
        <span><a href="#cloud-reading"><i>1</i>Learn</a></span>
        <span><a href="#cloud-example"><i>2</i>Example</a></span>
        <span className={checkpointPassed ? "done" : "active"}><a href="#cloud-checkpoint"><i>{checkpointPassed ? "✓" : "3"}</i>Checkpoint</a></span>
        <span className={result?.passed && evidencePassed && artifactPassed ? "done" : checkpointPassed ? "active" : ""}><a href="#cloud-lab-title"><i>{result?.passed && evidencePassed && artifactPassed ? "✓" : "4"}</i>Practice</a></span>
        <span className={completed ? "done" : ""}><a href="#cloud-complete"><i>{completed ? "✓" : "5"}</i>Complete</a></span>
      </nav>
      <div className="quest-story-strip"><span aria-hidden="true">◆<small>BYTE</small></span><p><strong>Byte’s briefing</strong>{lesson.story}</p><div aria-label={"Lesson " + lesson.id + " of " + lessonTotal}>{Array.from({ length: 5 }, (_, index) => <i key={index} className={index <= (lesson.id - 1) % 5 ? "active" : ""} />)}</div></div>
      <div className="lesson-workspace cloud-workspace">
        <article className="lesson-content cloud-reading" id="cloud-reading" aria-labelledby="cloud-objective">
          <div className="lesson-copy">
          <p className="pixel-kicker">STEP 1 · LEARN THE IDEA</p>
          <h1 id="cloud-objective">{lesson.title}</h1>
          <p className="learning-lead">{lesson.objective}</p>
          <LessonDepthPanel trackId={trackKind} paceId={paceId} title={lesson.title} />
          <div className="theory-heading"><span>KNOWLEDGE BLOCKS</span><h2>Build the concept piece by piece</h2></div>
          <div className="theory-grid rich">{lesson.concepts.map((concept, index) => <article key={concept.title}><span>0{index + 1}</span><div><h2>{concept.title}</h2><p>{concept.body}</p></div></article>)}</div>
          <section className="cloud-worked-example" id="cloud-example"><div className="theory-heading"><span>STEP 2 · EXAMPLE WALKTHROUGH</span><h2>A worked example</h2></div><div className="example-code"><div><span>{frontend ? "RENDERING CONTRACT" : "RELAY PLAN"}</span><small>READ ONLY</small></div><pre className="cloud-example" aria-label="Worked example"><code>{lesson.example}</code></pre></div><p>{lesson.exampleNote}</p></section>
          <div className="theory-insights cloud-insights"><article className="mistake-note"><span>! COMMON MISTAKE</span><h2>Watch out for this</h2><p>{lesson.mistake}</p></article></div>
          <section className="cloud-checkpoint" id="cloud-checkpoint" aria-labelledby="cloud-checkpoint-title">
            <div className="theory-heading"><span>STEP 3 · THREE REQUIRED DECISIONS</span><h2 id="cloud-checkpoint-title">Reason through the {frontend ? "interface" : "architecture"}</h2></div>
            <p className="cloud-checkpoint-progress">{checkpointResults.filter((entry) => entry === "correct").length} of {checkpoints.length} decisions verified</p>
            <div className="cloud-checkpoint-stack">{checkpoints.map((checkpoint, questionIndex) => {
              const choice = checkpointChoices[questionIndex];
              const decision = checkpointResults[questionIndex];
              return <section className={"cloud-checkpoint-card " + decision} key={checkpoint.question} aria-labelledby={"cloud-checkpoint-question-" + questionIndex}>
                <div className="cloud-checkpoint-number"><span>DECISION {questionIndex + 1}</span>{decision === "correct" && <strong>VERIFIED</strong>}</div>
                <div className="quiz-list cloud-checkpoint-options"><fieldset><legend id={"cloud-checkpoint-question-" + questionIndex}>{checkpoint.question}</legend>
                  {checkpoint.options.map((option, optionIndex) => <label className={choice === optionIndex ? "selected" : ""} key={option}><input type="radio" name={"cloud-checkpoint-" + paceId + "-" + lesson.id + "-" + questionIndex} checked={choice === optionIndex} onChange={() => chooseCheckpoint(questionIndex, optionIndex)} /><i>{String.fromCharCode(65 + optionIndex)}</i><span>{option}</span></label>)}
                </fieldset></div>
                <div className={"cloud-checkpoint-result " + decision} role="status">
                  <p>{decision === "correct" ? "✓ Correct — " + checkpoint.explanation : decision === "incorrect" ? "That choice is not supported by the scenario. Recheck the constraint and try again." : "Choose the safest response, then verify the decision."}</p>
                  {decision !== "correct" && <button className="curriculum-next cloud-button" disabled={choice === null} onClick={() => checkKnowledge(questionIndex)}>Verify decision →</button>}
                </div>
              </section>;
            })}</div>
          </section>
          <details className="cloud-json-help" open={lesson.id === 1}><summary>How the two local practice editors differ</summary><p>The {frontend ? "rendering contract" : "Relay plan"} simulator uses one flat configuration in JSON, HCL, or YAML so the same design model can be compared across formats.</p><pre><code>{'JSON   "timeout_ms": 500\nHCL    timeout_ms = 500\nYAML   timeout_ms: 500'}</code></pre><p>{frontend ? "The artifact studio uses realistic HTML, CSS, TypeScript, and frontend delivery-policy text." : backend ? "The artifact studio uses realistic nested OpenAPI, service configuration, SQL migration, and event-schema text." : "The artifact studio uses realistic nested Terraform, Kubernetes, IAM, or CI/CD text."} Its static rules never execute a command, contact a provider, or require credentials.</p></details>
          <p className="cloud-reference">Go deeper: <a href={lesson.source.url} target="_blank" rel="noreferrer">{lesson.source.label} ↗</a></p>
          </div>
        </article>
        <section className="coding-station cloud-lab" aria-labelledby="cloud-lab-title">
          <p className="pixel-kicker">STEP 4 · REPAIR AND TROUBLESHOOT</p>
          <h2 id="cloud-lab-title">{worldProject ? "Multi-stage " + trackShortLabel + " mission" : "Your " + trackLabel + " lab"}</h2>
          <p className="cloud-mission">{lesson.mission}</p>
          <p className="cloud-simulation-note"><strong>Local, static training only.</strong> {frontend ? "No submitted markup, style, script, or policy is executed or published." : backend ? "No server, database, queue, external API, or credentials are used." : "No provider login, live infrastructure, external API, credentials, or cloud charges."} Every scanner runs deterministically in this page.</p>
          {worldProject && <section className="cloud-capstone-stages" aria-labelledby="cloud-capstone-title">
            <div><small>WORLD PROJECT</small><h3 id="cloud-capstone-title">Four-stage {frontend ? "product experience" : "architecture"} and recovery review</h3><p>Complete each gate in order, from design reasoning through incident evidence and two independent repairs.</p></div>
            <ol>
              <li className={checkpointPassed ? "done" : "active"}><span>{checkpointPassed ? "✓" : "1"}</span><div><strong>{frontend ? "Interface" : "Architecture"} decisions</strong><small>Three scenarios</small></div></li>
              <li className={evidencePassed ? "done" : checkpointPassed ? "active" : ""}><span>{evidencePassed ? "✓" : "2"}</span><div><strong>Incident triage</strong><small>{evidence.label}</small></div></li>
              <li className={artifactPassed ? "done" : checkpointPassed && evidencePassed ? "active" : ""}><span>{artifactPassed ? "✓" : "3"}</span><div><strong>Artifact repair</strong><small>{artifact.label}</small></div></li>
              <li className={result?.passed ? "done" : checkpointPassed && evidencePassed && artifactPassed ? "active" : ""}><span>{result?.passed ? "✓" : "4"}</span><div><strong>{frontend ? "Experience" : "System"} verification</strong><small>{frontend ? "Rendering contract" : "Relay plan"}</small></div></li>
            </ol>
          </section>}

          <section className="cloud-evidence-lab" aria-labelledby="cloud-evidence-title">
            <header><span>{evidence.label}</span><h3 id="cloud-evidence-title">Evidence lab · {evidence.title}</h3><p>{evidence.briefing}</p></header>
            <pre aria-label={evidence.label}><code>{evidence.evidence}</code></pre>
            <div className="quiz-list cloud-evidence-options"><fieldset><legend>{evidence.question}</legend>
              {evidence.options.map((option, index) => <label className={evidenceChoice === index ? "selected" : ""} key={option}><input type="radio" name={"cloud-evidence-" + paceId + "-" + lesson.id} checked={evidenceChoice === index} onChange={() => { setEvidenceChoice(index); setEvidenceResult("idle"); setSaveError(""); }} /><i>{String.fromCharCode(65 + index)}</i><span>{option}</span></label>)}
            </fieldset></div>
            <div className={"cloud-evidence-result " + evidenceResult} role="status"><p>{evidenceResult === "correct" ? "✓ Investigation verified — " + evidence.explanation : evidenceResult === "incorrect" ? "That conclusion goes beyond, or ignores, the available evidence. Re-read the signal sequence." : "Select the conclusion best supported by the evidence."}</p>{evidenceResult !== "correct" && <button className="curriculum-next cloud-button" disabled={evidenceChoice === null} onClick={checkEvidence}>Verify investigation →</button>}</div>
          </section>

          <section className="cloud-artifact-studio" aria-labelledby="cloud-artifact-title">
            <header><div><span>REALISTIC ARTIFACT · {artifact.language}</span><h3 id="cloud-artifact-title">Static artifact review</h3></div><code>{artifact.filename}</code></header>
            <p>{artifact.brief}</p>
            <div className="cloud-editor-heading"><label htmlFor="cloud-artifact">{artifact.label}</label><span>Nested syntax · never executed</span></div>
            <textarea id="cloud-artifact" className="cloud-editor cloud-artifact-editor" value={artifactCode} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" maxLength={24_000} aria-describedby="cloud-artifact-help" onChange={(event) => editArtifact(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); runArtifact(); } }} />
            <p className="cloud-editor-help" id="cloud-artifact-help">Repair the injected risks while preserving the nested document. The validator checks structure and policy signals as plain text or JSON; it never runs the artifact.</p>
            <div className="cloud-lab-actions"><button className="curriculum-next cloud-button" onClick={runArtifact}>Run static review →</button><button className="cloud-text-button" onClick={loadArtifactFailure}>Reload injected risk</button></div>
            <div className="cloud-artifact-results" aria-label="Static artifact results">
              <p className="cloud-result-status" role="status">{!artifactResult ? "Injected risks loaded. Run the static review to produce findings." : artifactResult.error ? artifactResult.error : artifactResult.passed ? "Artifact verified. Every static safety rule passes." : artifactResult.checks.filter((entry) => entry.passed).length + "/" + artifactResult.checks.length + " artifact checks passed on review " + artifactAttempts + "."}</p>
              {artifactResult && !artifactResult.error && <ul className="cloud-checks">{artifactResult.checks.map((entry) => <li className={entry.passed ? "passed" : "failed"} key={entry.name}><span>{entry.passed ? "PASS" : "FIX"}</span><div><strong>{entry.name}</strong>{!entry.passed && <details><summary>Show repair hint</summary><p>{entry.hint}</p></details>}</div></li>)}</ul>}
            </div>
          </section>

          <div className="cloud-stage-heading"><span>{frontend ? "EXPERIENCE SIMULATOR" : "ARCHITECTURE SIMULATOR"}</span><h3>Repair the {frontend ? "rendering contract" : "Relay plan"}</h3><p>Choose JSON, HCL, or YAML and repair the same fictional {frontend ? "interface" : "system"} model.</p></div>
          <div className="cloud-format-tabs" role="tablist" aria-label="Configuration format">
            {FORMATS.map((entry) => <button key={entry} type="button" role="tab" aria-selected={format === entry} aria-controls="cloud-plan" className={format === entry ? "active" : ""} onClick={() => switchFormat(entry)}>{formatLabel(entry)}</button>)}
          </div>
          <div className="cloud-editor-heading"><label htmlFor="cloud-plan">{frontend ? "Rendering contract" : "Relay plan"} · {formatLabel(format)}</label><span>Safe flat training syntax</span></div>
          <textarea id="cloud-plan" className="cloud-editor" value={code} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" maxLength={16_000} aria-describedby="cloud-editor-help" onChange={(event) => edit(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); } }} />
          <p className="cloud-editor-help" id="cloud-editor-help">Edit the injected failure, then run the simulation. Ctrl/⌘ + Enter also runs it. Format switching converts valid syntax without changing the plan.</p>
          <div className="cloud-lab-actions">
            <button className="curriculum-next cloud-button" onClick={run}>Run simulation →</button>
            <button className="curriculum-next cloud-button cloud-button-secondary" onClick={formatCurrent}>Format {formatLabel(format)}</button>
            <button className="cloud-text-button" onClick={loadFailureScenario}>Reload failure scenario</button>
            {undoCode !== null && <button className="cloud-text-button" onClick={() => { edit(undoCode); setUndoCode(null); }}>Undo reset</button>}
          </div>
          {draftWarning && <p role="status">{draftWarning}</p>}
          <details className="cloud-field-guide" open={lesson.id === 1}><summary>Field guide · {lesson.fields.length} required fields</summary><dl>{lesson.fields.map((entry) => <div key={entry.key}><dt><code>{entry.key}</code><span>{entry.type === "strings" ? "string array" : entry.type}</span></dt><dd>{entry.help}</dd></div>)}</dl></details>
          <section className="cloud-results" aria-label="Simulation results">
            <p className="cloud-result-status" role="status">{!result ? "Failure scenario loaded. Run the simulation to collect evidence." : result.error ? result.error : result.passed ? "All checks passed. The failure is isolated and the repaired plan meets the lesson’s model." : result.checks.filter((entry) => entry.passed).length + "/" + result.checks.length + " checks passed on attempt " + attempts + ". Use the triage runbook below, change one assumption, and rerun."}</p>
            {result && !result.error && <>
              <ul className="cloud-checks">{result.checks.map((entry) => <li className={entry.passed ? "passed" : "failed"} key={entry.name}><span>{entry.passed ? "PASS" : "FIX"}</span><div><strong>{entry.name}</strong>{!entry.passed && <details><summary>Show repair hint</summary><p>{entry.hint}</p></details>}</div></li>)}</ul>
              {!result.passed && <section className="cloud-troubleshooting" aria-labelledby="cloud-troubleshooting-title">
                <header><span>◆</span><div><small>INCIDENT TRIAGE · ATTEMPT {attempts}</small><h3 id="cloud-troubleshooting-title">Troubleshooting runbook</h3><p>Follow evidence before changing the plan. Repair one hypothesis, rerun, and verify that you did not break a passing control.</p></div></header>
                <div>{result.checks.filter((entry) => !entry.passed).map((entry, index) => <article key={entry.name}><small>FAILED SIGNAL {String(index + 1).padStart(2, "0")}</small><strong>{entry.name}</strong><p><b>Observed evidence</b>{result.observations[index % Math.max(1, result.observations.length)] ?? "The configured value does not satisfy this control."}</p><p><b>Repair hypothesis</b>{entry.hint}</p></article>)}</div>
                <footer>Next move: change the smallest relevant value, rerun the simulation, and compare the new trace.</footer>
              </section>}
              <h3>Simulation trace</h3><ol className="cloud-trace">{result.observations.map((line) => <li key={line}>{line}</li>)}</ol>
            </>}
          </section>
          <div id="cloud-complete">{saveError && <p className="cloud-error" role="alert">{saveError}</p>}
          {completed ? (
            <div className="cloud-completion" role="status">
              <h3>{daily ? "Daily Quest complete!" : lesson.id === lessonTotal ? path.title + " complete!" : "Lesson verified"}</h3>
              <p>{newlyCompleted ? "+" + rewardXp + " XP · Progress saved in this browser." : daily ? "Today’s reward is already claimed. Replay the scenario in any format for practice." : "Your completion is saved. Replay any time; XP is awarded once."}</p>
              {daily ? <><p>A new deterministic {trackShortLabel} challenge arrives at 00:00 UTC.</p><a className="curriculum-next cloud-button" href={"/roadmap/" + trackKind + "/" + paceId}>Return to {path.label} roadmap →</a></> : lesson.id < lessonTotal ? <a className="curriculum-next cloud-button" href={lessonPath(trackKind, paceId, lesson.id + 1)}>Next lesson →</a> : <><p>You have completed {path.title}. This is a learning milestone, not a production-readiness certification.</p><a className="curriculum-next cloud-button" href={"/roadmap/" + trackKind + "/" + paceId}>View completed path →</a></>}
            </div>
          ) : (
            <div className="cloud-complete-action">
              <button className="curriculum-next cloud-button" disabled={!canComplete} onClick={complete}>{daily ? "Claim daily reward" : "Complete lesson"} · +{rewardXp} XP</button>
              <p>{canComplete ? "All decision, evidence, artifact, and system checks passed. Save your completion." : `Finish all four gates: ${frontend ? "interface" : "architecture"} decisions, evidence triage, static artifact review, and the ${frontend ? "rendering contract" : "Relay plan"} simulation.`}</p>
            </div>
          )}
          {lesson.id === lessonTotal && result?.passed && artifactPassed && <button className="curriculum-next cloud-button cloud-button-secondary cloud-download" onClick={download}>Download verified review bundle ↓</button>}
          </div>
        </section>
      </div>
      <footer className="cloud-lesson-footer">{daily ? <a href={"/roadmap/" + trackKind + "/" + paceId}>← Close Daily Quest</a> : lesson.id > 1 ? <a href={lessonPath(trackKind, paceId, lesson.id - 1)}>← Previous lesson</a> : <a href={"/tracks/" + trackKind}>← {trackShortLabel} paths</a>}<a href={"/roadmap/" + trackKind + "/" + paceId}>Back to roadmap</a></footer>
    </>
  );
}
