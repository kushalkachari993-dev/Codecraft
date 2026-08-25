"use client";

import { SignInButton, useAuth, useClerk, useUser } from "@clerk/react";
import Link from "next/link";
import { useState } from "react";

export default function DeleteAccountPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [confirmation, setConfirmation] = useState("");
  const [state, setState] = useState<"idle" | "deleting" | "error">("idle");
  const [message, setMessage] = useState("");

  const deleteAccount = async () => {
    if (confirmation !== "DELETE") return;
    setState("deleting");
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified.");
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Account deletion failed.");
      for (const key of ["codecraft-progress-v3", "codecraft-progress-v2", "codecraft-xp", "codecraft-analytics-session-v1"]) {
        window.localStorage.removeItem(key);
      }
      await clerk.signOut({ redirectUrl: "/" });
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Account deletion failed.");
    }
  };

  return (
    <main className="legal-page delete-account-page">
      <Link className="legal-back" href="/">← Return to CodeCraft</Link>
      <header className="legal-hero danger">
        <p>CODECRAFT · FINAL ACCOUNT ACTION</p>
        <h1>Delete account</h1>
        <span>This action cannot be undone.</span>
      </header>

      {!isLoaded ? (
        <section><p>Checking your account…</p></section>
      ) : !isSignedIn ? (
        <section>
          <h2>Sign in required</h2>
          <p>Sign in to verify ownership before requesting permanent deletion.</p>
          <SignInButton mode="modal"><button className="legal-primary-button">Sign in</button></SignInButton>
        </section>
      ) : (
        <>
          <section>
            <h2>Data that will be deleted</h2>
            <ul>
              <li>Your CodeCraft learner profile and cloud progress</li>
              <li>Saved Python, SQL, and GenAI submissions</li>
              <li>Daily AI-review usage records</li>
              <li>Analytics events and beta feedback linked to your account</li>
              <li>Your Clerk authentication account</li>
            </ul>
            <p>You are deleting <strong>{user?.primaryEmailAddress?.emailAddress ?? "the signed-in account"}</strong>. Local CodeCraft progress on this browser will also be cleared.</p>
          </section>
          <section className="delete-confirmation">
            <label htmlFor="delete-confirmation">Type <strong>DELETE</strong> to confirm</label>
            <input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
            {message && <p role="alert">{message}</p>}
            <button className="legal-delete-button" disabled={confirmation !== "DELETE" || state === "deleting"} onClick={() => void deleteAccount()}>
              {state === "deleting" ? "Deleting account…" : "Permanently delete account"}
            </button>
          </section>
        </>
      )}
      <Link className="legal-muted-link" href="/privacy">Read the privacy notice</Link>
    </main>
  );
}
