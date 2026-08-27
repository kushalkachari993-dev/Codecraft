"use client";

import { useEffect, useState } from "react";
import type { LearningTrackId, LessonEnrichment } from "../authored-lessons";

type EnrichmentBundle = typeof import("../lesson-enrichment-bundle");
type EnrichmentState = {
  key: string;
  value: LessonEnrichment | null;
};

let enrichmentBundlePromise: Promise<EnrichmentBundle> | null = null;

export function preloadLessonEnrichment() {
  enrichmentBundlePromise ??= import("../lesson-enrichment-bundle");
  return enrichmentBundlePromise;
}

export function useLessonEnrichment({ enabled, trackId, paceId, title }: {
  enabled: boolean;
  trackId: LearningTrackId;
  paceId: string;
  title: string;
}) {
  const key = `${trackId}:${paceId}:${title}`;
  const [state, setState] = useState<EnrichmentState>({ key: "", value: null });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void preloadLessonEnrichment()
      .then(({ getAuthoredLessonEnrichment }) => {
        if (cancelled) return;
        setState({ key, value: getAuthoredLessonEnrichment(trackId, paceId, title) ?? null });
      })
      .catch(() => {
        if (!cancelled) setState({ key, value: null });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, key, paceId, title, trackId]);

  const current = state.key === key;
  return {
    enrichment: current ? state.value : null,
    loading: enabled && !current,
  };
}
