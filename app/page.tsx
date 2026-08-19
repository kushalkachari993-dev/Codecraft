"use client";

import { useEffect, useRef, useState } from "react";

const starterCode = `repeat 4 times:
  place_block()
  move_forward()`;

type RunState = "idle" | "running" | "success" | "error";

export default function Home() {
  const [code, setCode] = useState(starterCode);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<RunState>("idle");
  const [message, setMessage] = useState("Build a safe path to the portal.");
  const [xp, setXp] = useState(120);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("codecraft-xp");
    if (saved) setXp(Number(saved));
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setCode(starterCode);
    setStep(0);
    setStatus("idle");
    setMessage("Build a safe path to the portal.");
  };

  const runCode = () => {
    if (timer.current) clearInterval(timer.current);
    const repeatMatch = code.match(/repeat\s+(\d+)\s+times\s*:/i);
    const hasPlace = /place_block\s*\(\s*\)/i.test(code);
    const hasMove = /move_forward\s*\(\s*\)/i.test(code);
    const repeats = repeatMatch ? Number(repeatMatch[1]) : 0;

    if (!repeatMatch || !hasPlace || !hasMove) {
      setStatus("error");
      setStep(0);
      setMessage("Byte needs a repeat loop with place_block() and move_forward().");
      return;
    }
    if (repeats !== 4) {
      setStatus("error");
      setStep(Math.min(repeats, 3));
      setMessage(repeats < 4 ? "Almost! The ravine is 4 blocks wide." : "That loop runs too many times. Try exactly 4.");
      return;
    }

    setStatus("running");
    setStep(0);
    setMessage("Running your program…");
    let current = 0;
    timer.current = setInterval(() => {
      current += 1;
      setStep(current);
      if (current === 4) {
        if (timer.current) clearInterval(timer.current);
        window.setTimeout(() => {
          setStatus("success");
          setMessage("Quest complete — you used a loop to cross the ravine!");
          setXp((previous) => {
            const next = previous === 120 ? 170 : previous;
            window.localStorage.setItem("codecraft-xp", String(next));
            return next;
          });
        }, 500);
      }
    }, 520);
  };

  const insertBlock = (block: "loop" | "place" | "move") => {
    if (block === "loop") setCode(starterCode);
    else setCode((current) => `${current.trimEnd()}\n  ${block === "place" ? "place_block()" : "move_forward()"}`);
    setStatus("idle");
    setMessage("Code updated. Run it when you’re ready.");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="CodeCraft home">
          <span className="brand-cube" aria-hidden="true">C</span>
          <span>CODECRAFT</span>
        </a>
        <div className="world-title"><span>WORLD 1 · QUEST 1 OF 5</span><strong>The Emerald Valley</strong></div>
        <div className="player-stats"><span aria-label={`${xp} experience points`}>★ {xp} XP</span><div className="avatar" aria-label="Player K">K</div></div>
      </header>

      <div className="progress-track" aria-label="Quest progress"><span className={status === "success" ? "complete" : ""} /></div>

      <section className="workspace">
        <aside className="mission-panel">
          <p className="eyebrow">QUEST 01</p>
          <h1>Bridge the gap</h1>
          <p className="quest-copy">Help Byte cross the ravine. Place a block, move forward, and repeat.</p>
          <div className="concept-card">
            <span className="concept-icon">↻</span>
            <div><small>NEW CONCEPT</small><strong>Loops</strong></div>
          </div>
          <div className="objective"><span>{status === "success" ? "●" : "○"}</span><p><strong>Your objective</strong><br />Reach the glowing portal</p></div>
          <div className="learning-path" aria-label="Learning path">
            <div className="path-item active"><b>01</b><span>Loops<small>Current quest</small></span></div>
            <div className="path-item"><b>02</b><span>Variables<small>Locked</small></span></div>
            <div className="path-item"><b>03</b><span>Conditions<small>Locked</small></span></div>
          </div>
          <div className="tip"><strong>💡 Guide</strong><p>A loop repeats the code inside it. Perfect for building a bridge!</p></div>
        </aside>

        <section className="game-panel" aria-label="Block world game view">
          <div className="sun" />
          <div className="cloud cloud-one" /><div className="cloud cloud-two" />
          <div className="mountains" />
          <div className="world">
            <div className="island island-left"><span className="tree" /></div>
            <div className="bridge-preview" aria-label={`${step} of 4 bridge blocks placed`}>
              {[1, 2, 3, 4].map((block) => <i className={step >= block ? "placed" : ""} key={block} />)}
            </div>
            <div className="island island-right"><span className="portal">✦</span></div>
          </div>
          <span className={`runner step-${step} ${status === "success" ? "celebrate" : ""}`} aria-label="Byte the robot">🤖</span>
          <div className={`game-message ${status}`} role="status"><span>{status === "error" ? "!" : status === "success" ? "✓" : status === "running" ? "▶" : "◆"}</span>{message}</div>
          {status === "success" && <div className="success-card"><small>QUEST COMPLETE</small><strong>Loop legend!</strong><p>+50 XP earned</p><button onClick={reset}>Play again</button></div>}
          <div className="camera-label"><span>◉</span> BLOCK WORLD SIMULATION</div>
        </section>

        <aside className="code-panel">
          <div className="code-heading"><div><p className="eyebrow">YOUR CODE</p><h2>Program Byte</h2></div><button className="reset-button" onClick={reset}>↺ Reset</button></div>
          <p className="code-help">Edit the code or tap a command block.</p>
          <div className="block-tray">
            <button onClick={() => insertBlock("loop")}>↻ repeat <b>4</b> times</button>
            <button onClick={() => insertBlock("place")}>▣ place block</button>
            <button onClick={() => insertBlock("move")}>↑ move forward</button>
          </div>
          <div className={`editor-wrap ${status === "error" ? "has-error" : ""}`}>
            <div className="line-numbers" aria-hidden="true">{code.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(event) => { setCode(event.target.value); setStatus("idle"); }}
              onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runCode(); }}
              aria-label="Python-style code editor"
              spellCheck={false}
            />
          </div>
          <button className="run-button" onClick={runCode} disabled={status === "running"}>{status === "running" ? "RUNNING…" : "▶ RUN CODE"}</button>
          <p className="shortcut">Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run</p>
          <div className="syntax-note"><strong>What happens?</strong><p>Each loop places one block, then moves Byte forward one space.</p></div>
        </aside>
      </section>
    </main>
  );
}
