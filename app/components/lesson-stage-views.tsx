"use client";

import type { KeyboardEvent } from "react";
import type { ExecutionResult } from "../execution/types";
import type { RunState, RuntimeReadiness } from "../hooks/use-lab-runtime";

export type LessonQuest = {
  id: number;
  title: string;
  concept: string;
  objective: string;
  guide: string;
  starterCode: string;
  xp: number;
  badge: string;
  scene: "movement" | "bridge" | "supplies" | "vault";
  steps: number;
};

export type LessonTheory = {
  overview: string;
  deeper: string;
  keyIdeas: Array<{ title: string; body: string }>;
  mentalModel: string;
  commonMistake: string;
  checkYourself: string[];
};

export type LessonQuizQuestion = { question: string; options: string[]; answer: number; explanation: string };
export type LessonEnrichmentView = { whyItMatters: string; walkthrough: Array<{ title: string; body: string }> };
export type GenAILabView = {
  title: string;
  brief: string;
  fileName: string;
  labType: string;
  required: boolean;
  dataFiles: string[];
  tools: string[];
  successCriteria: string[];
};
export type ChallengeView = {
  title: string;
  instructions: string;
  dataPreview?: string[];
  visibleExamples: Array<{ label: string; input: string; output: string }>;
  runtime: {
    requiredPatterns: unknown[];
    pythonTests?: unknown[];
    sqlTests?: unknown[];
  };
};

export function TheoryLessonView({ quest, theory, enrichment, trackIcon, requiredProject, genAILab, onContinue }: {
  quest: LessonQuest;
  theory: LessonTheory;
  enrichment: LessonEnrichmentView | null;
  trackIcon: string;
  requiredProject: boolean;
  genAILab: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="learning-screen">
      <div className="learning-main">
        <p className="pixel-kicker">STEP 1 · LEARN THE IDEA</p>
        <h1>{quest.concept}</h1>
        <p className="learning-lead">{theory.overview}</p>
        <div className="theory-foundation">
          <span>CORE EXPLANATION</span>
          <p>{theory.deeper}</p>
          {enrichment && <div className="theory-foundation lesson-impact"><span>WHY THIS MATTERS</span><p>{enrichment.whyItMatters}</p></div>}
        </div>
        <div className="theory-heading"><span>KNOWLEDGE BLOCKS</span><h2>Build the concept piece by piece</h2></div>
        <div className="theory-grid rich">
          {theory.keyIdeas.map((idea, index) => <article key={idea.title}><span>0{index + 1}</span><div><h2>{idea.title}</h2><p>{idea.body}</p></div></article>)}
        </div>
        <div className="theory-insights">
          <article className="mental-model"><span>◇ MENTAL MODEL</span><h2>Picture it this way</h2><p>{theory.mentalModel}</p></article>
          <article className="mistake-note"><span>! COMMON MISTAKE</span><h2>Watch out for this</h2><p>{theory.commonMistake}</p></article>
        </div>
        <div className="theory-checklist">
          <div><span>✓</span><div><small>QUICK SELF-CHECK</small><h2>Before you continue, ask yourself:</h2></div></div>
          <ul>{theory.checkYourself.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <button className="curriculum-next" onClick={onContinue}>See an explained example →</button>
      </div>
      <aside className="learning-aside"><div className="lesson-orb">{trackIcon}</div><p>SECTION GOAL</p><strong>{quest.objective}</strong><span>Learn the idea, study an example, then prove your understanding.</span><div className="aside-route"><small>YOUR ROUTE</small><b>Learn</b><i /> <b>Example</b><i /> <b>Quiz</b><i /> <b>{requiredProject ? "Project" : genAILab ? "AI lab" : "Optional code"}</b></div></aside>
    </section>
  );
}

export function ExampleLessonView({ quest, enrichment, trackId, onReview, onCheckpoint }: {
  quest: LessonQuest;
  enrichment: LessonEnrichmentView | null;
  trackId: "python" | "genai" | "sql";
  onReview: () => void;
  onCheckpoint: () => void;
}) {
  const walkthrough = enrichment?.walkthrough ?? [
    { title: "Set up the instruction", body: "The first meaningful line introduces the data, command, or query the program needs." },
    { title: "Apply the concept", body: `The program uses ${quest.concept.toLowerCase()} to perform the section's main job.` },
    { title: "Check the result", body: `A correct run should: ${quest.objective.toLowerCase()}.` },
  ];
  return (
    <section className="learning-screen example-screen">
      <div className="learning-main">
        <p className="pixel-kicker">STEP 2 · EXAMPLE WALKTHROUGH</p>
        <h1>See {quest.concept} in action</h1>
        <p className="learning-lead">Here is a complete, read-only example. Follow the idea line by line, then take the knowledge checkpoint.</p>
        <div className="example-code"><div><span>EXAMPLE.{trackId === "sql" ? "SQL" : "PY"}</span><small>READ ONLY</small></div><pre>{quest.starterCode}</pre></div>
        <div className="walkthrough-list">
          {walkthrough.map((step, index) => <article key={step.title}><b>{index + 1}</b><p><strong>{step.title}</strong>{step.body}</p></article>)}
        </div>
        <div className="curriculum-actions"><button onClick={onReview}>← Review theory</button><button className="curriculum-next" onClick={onCheckpoint}>Take the checkpoint →</button></div>
      </div>
      <aside className="learning-aside example-aside"><p>FIELD NOTE</p><strong>Examples are maps, not answers to memorize.</strong><span>Notice the structure and explain what each part contributes. Coding practice is optional after the quiz.</span></aside>
    </section>
  );
}

export function QuizLessonView({ quest, questions, answers, result, eliminatedOptions, worldPowerHint, worldPowerName, requiredProject, genAILab, onAnswer, onOpenBonus, onNext, onSubmit }: {
  quest: LessonQuest;
  questions: LessonQuizQuestion[];
  answers: Record<number, number>;
  result: "idle" | "incomplete" | "passed" | "failed";
  eliminatedOptions: Record<number, number[]>;
  worldPowerHint: string;
  worldPowerName: string;
  requiredProject: boolean;
  genAILab: boolean;
  onAnswer: (questionIndex: number, optionIndex: number) => void;
  onOpenBonus: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="quiz-screen">
      <div className="quiz-heading"><p className="pixel-kicker">STEP 3 · REQUIRED CHECKPOINT</p><h1>Prove what you learned</h1><span>{requiredProject ? `Answer all ${questions.length} questions correctly, then complete the applied project to stabilize this world.` : `Answer all ${questions.length} questions correctly to unlock the next section. No coding is required.`}</span></div>
      {worldPowerHint && <div className="world-power-result" role="status"><span>◆</span><p><strong>{worldPowerName} report</strong>{worldPowerHint}</p></div>}
      <div className="quiz-list">
        {questions.map((question, questionIndex) => (
          <fieldset key={question.question}><legend><span>{questionIndex + 1}</span>{question.question}</legend>
            {question.options.map((option, optionIndex) => <label className={(answers[questionIndex] === optionIndex ? "selected " : "") + ((eliminatedOptions[questionIndex] ?? []).includes(optionIndex) ? "eliminated" : "")} key={option}><input disabled={(eliminatedOptions[questionIndex] ?? []).includes(optionIndex)} type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => onAnswer(questionIndex, optionIndex)} /><i>{String.fromCharCode(65 + optionIndex)}</i><span>{option}</span></label>)}
            {result !== "idle" && answers[questionIndex] !== undefined && <p className={answers[questionIndex] === question.answer ? "correct" : "incorrect"}>{answers[questionIndex] === question.answer ? `✓ Correct — ${question.explanation}` : `✕ ${question.explanation}`}</p>}
          </fieldset>
        ))}
      </div>
      <div className={`quiz-result ${result}`}><p>{result === "passed" ? requiredProject ? `Checkpoint passed! The ${quest.badge} badge is yours. Finish the world project to continue.` : `Checkpoint passed! +${quest.xp} signal XP and the ${quest.badge} badge are yours.` : result === "failed" ? "Some answers need another look. Review the explanations and try again." : result === "incomplete" ? "Answer every question before submitting." : requiredProject ? "A required applied project follows this checkpoint." : "The optional practice lab appears after you stabilize this system."}</p>
        {result === "passed" ? requiredProject ? <div><button className="curriculum-next" onClick={onOpenBonus}>Start required world project →</button></div> : <div><button onClick={onOpenBonus}>{genAILab ? "Try optional AI lab +20 XP" : "Try optional coding +20 XP"}</button><button className="curriculum-next" onClick={onNext}>Skip bonus · Next section →</button></div> : <button className="curriculum-next" onClick={onSubmit}>Check answers</button>}
      </div>
    </section>
  );
}

type LabWorkspaceProps = {
  quest: LessonQuest;
  trackId: "python" | "genai" | "sql";
  genAILab: GenAILabView | null;
  challenge: ChallengeView | null;
  dailyQuestMode: boolean;
  dailyQuestCompleted: boolean;
  requiredProject: boolean;
  finalQuest: boolean;
  bonusXp: number;
  code: string;
  status: RunState;
  terminal: string;
  sceneStep: number;
  executionResult: ExecutionResult | null;
  executionPhase: string;
  runtimeReadiness: Record<"python" | "sql", RuntimeReadiness>;
  onReset: () => void;
  onCodeChange: (value: string) => void;
  onRun: () => void;
  onStop: () => void;
  onSubmit: () => void;
  onNext: () => void;
};

export function LabWorkspaceView(props: LabWorkspaceProps) {
  const runtimeState = props.trackId === "genai" ? "idle" : props.runtimeReadiness[props.trackId];
  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") props.onRun();
  };
  return (
    <div className="lesson-workspace">
      <section className="lesson-content">
        <div className="lesson-copy">
          <p className="pixel-kicker">{props.dailyQuestMode ? "DAILY QUEST · ONE REWARD PER DAY" : props.requiredProject ? "WORLD BOSS · REQUIRED PROJECT" : "OPTIONAL SIDE MISSION"} · +{props.bonusXp} XP</p>
          <h1>{props.genAILab?.title ?? props.challenge?.title ?? "Optional coding challenge"}</h1>
          <p>{props.genAILab?.brief ?? props.challenge?.instructions ?? `Rebuild the ${props.quest.concept} solution from a blank editor. This practice does not block your progress to the next section.`}</p>
          <div className="objective-card"><span>◆</span><div><small>{props.dailyQuestMode ? "TODAY'S OBJECTIVE" : "YOUR OBJECTIVE"}</small><strong>{props.quest.objective}</strong></div></div>
          <div className="guide-card"><span>?</span><p><strong>Field guide</strong>{props.quest.guide}</p></div>
          {props.genAILab && (
            <div className={`genai-lab-kit ${props.genAILab.required ? "required-project" : ""}`}>
              <div className="genai-lab-meta"><span>{props.genAILab.labType}</span><b>CONTROLLED AI LAB</b><small>NO PERSONAL API KEY · NO CREDITS</small></div>
              <div className="genai-lab-resources"><article><strong>SUPPLIED DATA</strong><div className="genai-lab-chips">{props.genAILab.dataFiles.map((file) => <span key={file}>{file}</span>)}</div></article><article><strong>LAB TOOLS</strong><div className="genai-lab-chips">{props.genAILab.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></article></div>
              <div className="genai-lab-criteria"><strong>SUCCESS CRITERIA</strong><ul>{props.genAILab.successCriteria.map((criterion) => <li key={criterion}>✓ {criterion}</li>)}</ul></div>
            </div>
          )}
          {props.challenge && (
            <div className="challenge-kit">
              {props.challenge.dataPreview && <div className="challenge-data"><strong>PRACTICE DATABASE</strong><div>{props.challenge.dataPreview.map((item) => <span key={item}>{item}</span>)}</div></div>}
              <div className="visible-examples">{props.challenge.visibleExamples.map((example) => <article key={example.label + example.input}><strong>{example.label}</strong><p><small>INPUT</small><code>{example.input}</code></p><p><small>EXPECTED</small><code>{example.output}</code></p></article>)}</div>
              <div className="hidden-check-note"><span>◈</span><p><strong>{(props.challenge.runtime.pythonTests?.length ?? props.challenge.runtime.sqlTests?.length ?? 0) + props.challenge.runtime.requiredPatterns.length} HIDDEN CHECKS</strong>Run the solution to receive precise pass/fail feedback and targeted hints.</p></div>
            </div>
          )}
        </div>

        <div className={`simulator scene-${props.quest.scene} ${props.status}`} aria-label={`${props.quest.title} CodeCraft realm simulation`}>
          <div className="sim-sky"><i /><i /></div>
          <div className="sim-status"><span>{props.status === "error" ? "!" : props.status === "complete" ? "✓" : props.status === "ready" ? "◆" : props.status === "running" ? "▶" : "○"}</span>{props.status === "running" ? "Byte is syncing your code…" : props.status === "ready" ? "Relay objective reached — submit it!" : props.status === "complete" ? "System restored!" : props.status === "error" ? "Check the terminal for a hint." : "Run your code to energize the realm."}</div>
          <div className="sim-stage"><div className="ground left-ground" /><div className="ground right-ground" /><div className="target">{props.quest.scene === "vault" ? "✦" : props.quest.scene === "supplies" ? "▤" : "◆"}</div><div className="path-blocks">{Array.from({ length: props.quest.steps }).map((_, index) => <i className={props.sceneStep > index ? "active" : ""} key={index} />)}</div><span className={`byte step-${props.sceneStep}`}>▣<b>BYTE</b></span></div>
          <div className="sim-footer">LIVE CODE-REALM SIMULATION · CORE RELAY LINK</div>
        </div>
      </section>

      <section className="coding-station">
        <div className="editor-topbar"><div><span className="file-dot">◆</span><strong>{props.genAILab?.fileName ?? (props.trackId === "sql" ? "query.sql" : "main.py")}</strong></div><button onClick={props.onReset}>↺ {props.trackId === "sql" ? "Reset database & code" : props.trackId === "python" ? "Reset code" : "Reset lab"}</button></div>
        <div className="snippet-tray bonus-tray">{props.genAILab ? "CONTROLLED AI RUNTIME · deterministic checks unlimited · 3 signed-in AI coaching reviews daily" : props.trackId === "sql" ? "REAL POSTGRESQL · warmed worker, fresh seeded database on every run" : "REAL PYTHON · warmed isolated browser worker with clean state per run"}</div>
        {props.trackId !== "genai" && props.status !== "running" && runtimeState !== "idle" && <div className={`runtime-loader runtime-${runtimeState}`} role="status" aria-live="polite"><i /><span><strong>{runtimeState === "ready" ? "RUNTIME READY" : runtimeState === "error" ? "PRELOAD PAUSED" : props.trackId === "python" ? "PREPARING PYTHON" : "PREPARING DATABASE"}</strong>{props.executionPhase}</span></div>}
        {props.status === "running" && <div className="runtime-loader" role="status" aria-live="polite"><i /><span><strong>{props.trackId === "python" ? "PREPARING PYTHON" : props.trackId === "sql" ? "PREPARING DATABASE" : "EVALUATING LAB"}</strong>{props.executionPhase}</span></div>}
        <div className={`code-window ${props.status === "error" ? "has-error" : ""}`}><div className="line-numbers" aria-hidden="true">{props.code.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div><textarea value={props.code} onChange={(event) => props.onCodeChange(event.target.value)} onKeyDown={handleEditorKeyDown} aria-label={`${props.quest.title} code editor`} spellCheck={false} /></div>
        <div className="editor-actions"><span>Ctrl + Enter to run</span>{props.status === "running" ? <button className="stop-execution" onClick={props.onStop}>■ Stop execution</button> : <button className="run-secondary" onClick={props.onRun}>▶ {props.genAILab ? "Evaluate lab" : props.trackId === "sql" ? "Run SQL" : "Run Python"}</button>}<button className="submit-primary" onClick={props.onSubmit} disabled={props.status !== "ready" && props.status !== "complete"}>{props.dailyQuestMode ? props.dailyQuestCompleted ? "Daily reward claimed" : "Claim daily reward" : `Submit ${props.requiredProject ? "boss project" : props.genAILab ? "practice lab" : "optional challenge"}`}</button></div>
        <div className={`terminal ${props.status}`}><div><span>{props.genAILab ? "CONTROLLED AI EVALUATOR" : props.trackId === "sql" ? "POSTGRESQL OUTPUT" : "PYTHON OUTPUT"}</span><i>{props.status === "running" ? "RUNNING" : props.status.toUpperCase()}</i></div><pre>{props.terminal}</pre>{props.executionResult && <div className="execution-details"><section className="execution-output"><h3>OUTPUT <small>{props.executionResult.durationMs}ms</small></h3><pre>{props.executionResult.stdout || "No stdout was produced."}</pre></section>{props.executionResult.table && <section className="result-table-panel"><h3>RESULT TABLE <small>{props.executionResult.table.rows.length} rows</small></h3><div><table><thead><tr>{props.executionResult.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{props.executionResult.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{props.executionResult.table!.columns.map((column) => <td key={column}>{row[column] === null || row[column] === undefined ? <i>NULL</i> : String(row[column])}</td>)}</tr>)}</tbody></table></div></section>}<section className="test-results"><h3>{props.genAILab ? "EVALUATION RUBRIC" : "TEST RESULTS"} <small>{props.executionResult.tests.filter((test) => test.passed).length}/{props.executionResult.tests.length} passed</small></h3><div>{props.executionResult.tests.map((test) => <article className={test.passed ? "passed" : "failed"} key={test.name}><span>{test.passed ? "✓" : "!"}</span><p><strong>{test.name}</strong>{test.detail}{!test.passed && test.hint && <small>Hint: {test.hint}</small>}</p></article>)}</div></section>{props.executionResult.error && <section className="execution-error"><h3>ERROR</h3><pre>{props.executionResult.error}</pre></section>}</div>}</div>
        {props.status === "complete" && <div className="quest-complete-banner"><div><span>✦</span><p><small>{props.dailyQuestMode ? "DAILY QUEST COMPLETE" : props.requiredProject ? "WORLD BOSS DEFEATED" : "SIDE MISSION COMPLETE"}</small><strong>+{props.bonusXp} {props.dailyQuestMode ? "daily" : props.requiredProject ? "project" : "bonus"} XP</strong></p></div><button onClick={props.onNext}>{props.dailyQuestMode ? "Return to roadmap" : props.requiredProject ? props.finalQuest ? "Finish path" : "Enter next world" : "Next section"} →</button></div>}
      </section>
    </div>
  );
}
