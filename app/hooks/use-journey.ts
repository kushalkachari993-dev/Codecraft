"use client";

import { useEffect, useRef, useState } from "react";

export type JourneyTrackId = "python" | "genai" | "sql";
export type JourneyPaceId = "beginner" | "intermediate" | "expert";

export type JourneyPreferences = {
  trackId: JourneyTrackId;
  paceId: JourneyPaceId;
  started: boolean;
  tutorialComplete: boolean;
};

const JOURNEY_STORAGE_KEY = "codecraft-journey-v1";
const DEFAULT_JOURNEY: JourneyPreferences = {
  trackId: "python",
  paceId: "beginner",
  started: false,
  tutorialComplete: false,
};

export function loadJourneyPreferences(): JourneyPreferences {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(JOURNEY_STORAGE_KEY) ?? "{}") as Partial<JourneyPreferences>;
    const trackId = parsed.trackId === "genai" || parsed.trackId === "sql" ? parsed.trackId : "python";
    const paceId = parsed.paceId === "intermediate" || parsed.paceId === "expert" ? parsed.paceId : "beginner";
    return {
      trackId,
      paceId,
      started: parsed.started === true,
      tutorialComplete: parsed.tutorialComplete === true,
    };
  } catch {
    return DEFAULT_JOURNEY;
  }
}

export function useJourney(onRestore: (journey: JourneyPreferences) => void) {
  const onRestoreRef = useRef(onRestore);
  const [journey, setJourney] = useState<JourneyPreferences>(DEFAULT_JOURNEY);
  const [goalRecommendation, setGoalRecommendation] = useState<JourneyTrackId>("python");
  const [paceRecommendation, setPaceRecommendation] = useState<JourneyPaceId>("beginner");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const savedJourney = loadJourneyPreferences();
      setJourney(savedJourney);
      setGoalRecommendation(savedJourney.trackId);
      setPaceRecommendation(savedJourney.paceId);
      onRestoreRef.current(savedJourney);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  const persistJourney = (next: JourneyPreferences) => {
    window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(next));
    setJourney(next);
  };

  return {
    journey,
    persistJourney,
    goalRecommendation,
    setGoalRecommendation,
    paceRecommendation,
    setPaceRecommendation,
    tutorialOpen,
    setTutorialOpen,
    tutorialStep,
    setTutorialStep,
  };
}
