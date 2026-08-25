"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getAnalyticsSessionId, type AnalyticsContext } from "./analytics-events";

type FeedbackState = "idle" | "sending" | "sent" | "error";
type FeedbackProps = {
  context: AnalyticsContext;
  getToken: () => Promise<string | null>;
  signedIn: boolean;
  worldPromptOpen: boolean;
  onDismissWorldPrompt: () => void;
};

const categories = [
  ["general", "Overall experience"],
  ["content", "Lesson content"],
  ["difficulty", "Difficulty"],
  ["bug", "Something broke"],
  ["idea", "Feature idea"],
] as const;

export default function BetaFeedback({ context, getToken, signedIn, worldPromptOpen, onDismissWorldPrompt }: FeedbackProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [contactAllowed, setContactAllowed] = useState(false);
  const [state, setState] = useState<FeedbackState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state !== "sending") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, state]);

  const postFeedback = async (payload: Record<string, unknown>) => {
    const token = signedIn ? await getToken().catch(() => null) : null;
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sessionId: getAnalyticsSessionId(), ...context, ...payload }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(body.error ?? "Feedback could not be saved.");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      setState("error");
      setStatusMessage("Add a short note before sending.");
      return;
    }
    setState("sending");
    setStatusMessage("");
    try {
      await postFeedback({ category, rating, message: message.trim(), contactAllowed });
      setState("sent");
      setStatusMessage("Feedback saved. Thank you for helping shape the beta.");
      setMessage("");
      setContactAllowed(false);
    } catch (error) {
      setState("error");
      setStatusMessage(error instanceof Error ? error.message : "Feedback could not be saved.");
    }
  };

  const answerDifficulty = async (difficulty: "too_easy" | "about_right" | "too_hard") => {
    onDismissWorldPrompt();
    try {
      await postFeedback({
        category: "difficulty",
        rating: difficulty === "about_right" ? 5 : difficulty === "too_easy" ? 3 : 2,
        difficulty,
        message: `First world difficulty: ${difficulty.replaceAll("_", " ")}.`,
        contactAllowed: false,
      });
    } catch {
      // This prompt stays non-blocking; the full form remains available.
    }
  };

  return (
    <>
      {worldPromptOpen && (
        <aside className="world-feedback-prompt" aria-label="First world feedback">
          <button className="world-feedback-close" onClick={onDismissWorldPrompt} aria-label="Dismiss feedback question">X</button>
          <small>ONE QUICK QUESTION</small>
          <strong>How did your first world feel?</strong>
          <div>
            <button onClick={() => void answerDifficulty("too_easy")}>Too easy</button>
            <button onClick={() => void answerDifficulty("about_right")}>About right</button>
            <button onClick={() => void answerDifficulty("too_hard")}>Too hard</button>
          </div>
        </aside>
      )}

      <button className="beta-feedback-trigger" onClick={() => { setOpen(true); setState("idle"); setStatusMessage(""); }} aria-haspopup="dialog">
        <span>?</span> Beta feedback
      </button>

      {open && (
        <div className="feedback-backdrop">
          <button className="feedback-backdrop-dismiss" onClick={() => setOpen(false)} aria-label="Close feedback" />
          <section className="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <header>
              <div><small>CODECRAFT BETA CHANNEL</small><h2 id="feedback-title">Help improve the realms</h2></div>
              <button onClick={() => setOpen(false)} aria-label="Close feedback">X</button>
            </header>
            {state === "sent" ? (
              <div className="feedback-success">
                <span>OK</span>
                <h3>Signal received</h3>
                <p>{statusMessage}</p>
                <button onClick={() => setOpen(false)}>Return to the realm</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <fieldset>
                  <legend>How would you rate this experience?</legend>
                  <div className="feedback-rating">
                    {[1, 2, 3, 4, 5].map((value) => <button type="button" className={rating === value ? "selected" : ""} onClick={() => setRating(value)} key={value} aria-label={`${value} out of 5`}>*<small>{value}</small></button>)}
                  </div>
                </fieldset>
                <label><span>What is this about?</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label><span>What should we know?</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1200} rows={5} placeholder="Tell us what worked, what felt confusing, or what you would change." /><small>{message.length}/1200</small></label>
                {signedIn && <label className="feedback-consent"><input type="checkbox" checked={contactAllowed} onChange={(event) => setContactAllowed(event.target.checked)} /><span>You may follow up using my account email.</span></label>}
                <p className="feedback-privacy">Do not include passwords, API keys, code, prompts, or personal information. Feedback includes only your current track, pace, topic, and world.</p>
                {statusMessage && <p className="feedback-error" role="alert">{statusMessage}</p>}
                <footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><button className="feedback-submit" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Send feedback"}</button></footer>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
