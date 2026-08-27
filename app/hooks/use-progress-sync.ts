"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PROGRESS, mergeProgress, normalizeProgress, type PlayerProgress } from "../progress";

export type CloudUser = { displayName: string; email: string };
export type CloudState = "checking" | "local" | "syncing" | "synced" | "error";

type TokenGetter = () => Promise<string | null>;

export function loadLocalProgress(): PlayerProgress {
  try {
    const saved = window.localStorage.getItem("codecraft-progress-v3");
    if (saved) return normalizeProgress(JSON.parse(saved));

    const previous = window.localStorage.getItem("codecraft-progress-v2");
    if (previous) {
      const parsed = JSON.parse(previous) as { xp?: number; completed?: number[] };
      return normalizeProgress({
        xp: Number.isFinite(parsed.xp) ? Number(parsed.xp) : DEFAULT_PROGRESS.xp,
        completed: { python: Array.isArray(parsed.completed) ? parsed.completed : [] },
        coding: { python: Array.isArray(parsed.completed) ? parsed.completed : [] },
      });
    }

    const legacyXp = Number(window.localStorage.getItem("codecraft-xp"));
    return Number.isFinite(legacyXp) && legacyXp > 0
      ? normalizeProgress({ xp: legacyXp })
      : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

type ProgressSyncOptions = {
  clerkLoaded: boolean;
  clerkSignedIn: boolean;
  displayName: string;
  email: string;
  getToken: TokenGetter;
};

export function useProgressSync({ clerkLoaded, clerkSignedIn, displayName, email, getToken }: ProgressSyncOptions) {
  const [progress, setProgress] = useState<PlayerProgress>(() => typeof window === "undefined" ? DEFAULT_PROGRESS : loadLocalProgress());
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudState, setCloudState] = useState<CloudState>("checking");
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    if (!clerkLoaded) return;
    const controller = new AbortController();
    const localProgress = loadLocalProgress();
    void Promise.resolve().then(async () => {
      if (!clerkSignedIn) {
        setCloudUser(null);
        setCloudState("local");
        setProgressReady(true);
        return null;
      }
      const token = await getToken();
      if (!token) throw new Error("Clerk session token is unavailable");
      return fetch("/api/progress", {
        signal: controller.signal,
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
      });
    })
      .then(async (response) => {
        if (!response) return null;
        if (!response.ok) throw new Error("Progress lookup failed");
        return response.json() as Promise<{ user: CloudUser | null; progress: PlayerProgress | null }>;
      })
      .then((payload) => {
        if (!payload) return;
        if (!payload.user) {
          setCloudState("local");
          return;
        }
        const merged = mergeProgress(localProgress, normalizeProgress(payload.progress));
        window.localStorage.setItem("codecraft-progress-v3", JSON.stringify(merged));
        window.localStorage.setItem("codecraft-xp", String(merged.xp));
        setProgress(merged);
        setCloudUser({ displayName, email });
        setCloudState("syncing");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setCloudState("local");
      })
      .finally(() => setProgressReady(true));
    return () => controller.abort();
  }, [clerkLoaded, clerkSignedIn, displayName, email, getToken]);

  useEffect(() => {
    if (!progressReady || !cloudUser || !clerkSignedIn) return;
    const saveTimer = window.setTimeout(() => {
      setCloudState("syncing");
      void getToken().then((token) => {
        if (!token) throw new Error("Clerk session token is unavailable");
        return fetch("/api/progress", {
          method: "PUT",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ progress }),
        });
      }).then((response) => {
        if (!response.ok) throw new Error("Cloud save failed");
        setCloudState("synced");
      }).catch(() => setCloudState("error"));
    }, 650);
    return () => window.clearTimeout(saveTimer);
  }, [clerkSignedIn, cloudUser, getToken, progress, progressReady]);

  const persistProgress = (nextProgress: PlayerProgress) => {
    const normalized = normalizeProgress(nextProgress);
    window.localStorage.setItem("codecraft-progress-v3", JSON.stringify(normalized));
    window.localStorage.setItem("codecraft-xp", String(normalized.xp));
    setProgress(normalized);
  };

  return { progress, persistProgress, cloudUser, cloudState };
}
