"use client";
import { useEffect } from "react";
import { rememberLesson } from "../learning-memory";
import type { JourneyPaceId, JourneyTrackId } from "./use-journey";
export function useLearningVisit(trackId: JourneyTrackId, paceId: JourneyPaceId, lessonId: number, title: string, enabled = true) {
  useEffect(() => { if (enabled) rememberLesson({ trackId, paceId, lessonId, title }); }, [trackId, paceId, lessonId, title, enabled]);
}

