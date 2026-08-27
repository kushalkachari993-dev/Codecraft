"use client";

import { useEffect, useState, type FormEvent } from "react";

export type SavedSubmission = {
  submission_id: string;
  track: "python" | "genai" | "sql";
  pace: "beginner" | "intermediate" | "expert";
  topic_id: number;
  topic: string;
  stage: "attempt" | "submitted";
  passed: number | boolean;
  score: number;
  created_at: number;
};

export type SubmissionsState = "idle" | "loading" | "ready" | "error";

type ProfileOptions = {
  signedIn: boolean;
  firstName: string;
  lastName: string;
  getToken: () => Promise<string | null>;
  updateName: ((firstName: string, lastName: string | null) => Promise<void>) | null;
  initialOpen?: boolean;
};

export function useProfile({ signedIn, firstName, lastName, getToken, updateName, initialOpen = false }: ProfileOptions) {
  const [profileOpen, setProfileOpen] = useState(initialOpen);
  const [editingName, setEditingName] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [lastNameDraft, setLastNameDraft] = useState("");
  const [nameSaveState, setNameSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [nameError, setNameError] = useState("");
  const [savedSubmissions, setSavedSubmissions] = useState<SavedSubmission[]>([]);
  const [submissionsState, setSubmissionsState] = useState<SubmissionsState>("idle");

  useEffect(() => {
    if (!profileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen || !signedIn) return;
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => {
        setSubmissionsState("loading");
        return getToken();
      })
      .then((token) => {
        if (!token) throw new Error("Clerk session token is unavailable");
        return fetch("/api/submissions", {
          signal: controller.signal,
          headers: { accept: "application/json", authorization: `Bearer ${token}` },
        });
      })
      .then((response) => {
        if (!response.ok) throw new Error("Submissions lookup failed");
        return response.json() as Promise<{ submissions?: SavedSubmission[] }>;
      })
      .then((payload) => {
        setSavedSubmissions(Array.isArray(payload.submissions) ? payload.submissions : []);
        setSubmissionsState("ready");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setSubmissionsState("error");
      });
    return () => controller.abort();
  }, [getToken, profileOpen, signedIn]);

  const openProfile = () => {
    setFirstNameDraft(firstName);
    setLastNameDraft(lastName);
    setNameSaveState("idle");
    setNameError("");
    setSavedSubmissions([]);
    setSubmissionsState(signedIn ? "loading" : "idle");
    setEditingName(false);
    setProfileOpen(true);
  };

  const beginNameEdit = () => {
    setFirstNameDraft(firstName);
    setLastNameDraft(lastName);
    setNameSaveState("idle");
    setNameError("");
    setEditingName(true);
  };

  const closeProfile = () => {
    setEditingName(false);
    setProfileOpen(false);
  };

  const cancelNameEdit = () => setEditingName(false);

  const saveProfileName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!updateName) return;
    const nextFirstName = firstNameDraft.trim();
    const nextLastName = lastNameDraft.trim();
    if (!nextFirstName) {
      setNameSaveState("error");
      setNameError("Enter a first name or player name.");
      return;
    }
    setNameSaveState("saving");
    setNameError("");
    try {
      await updateName(nextFirstName, nextLastName || null);
      setNameSaveState("saved");
      setEditingName(false);
    } catch {
      setNameSaveState("error");
      setNameError("We could not save that name. Check it and try again.");
    }
  };

  return {
    profileOpen,
    openProfile,
    closeProfile,
    editingName,
    beginNameEdit,
    cancelNameEdit,
    firstNameDraft,
    setFirstNameDraft,
    lastNameDraft,
    setLastNameDraft,
    nameSaveState,
    nameError,
    saveProfileName,
    savedSubmissions,
    submissionsState,
  };
}
