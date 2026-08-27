"use client";

import { useEffect, useState } from "react";
import type { TopicChallenge } from "../challenges";
import type { PythonTopic } from "../python-curriculum";
import type { SQLTopic } from "../sql-curriculum";

type LabTrack = "python" | "sql";
type ChallengeTopic = PythonTopic | SQLTopic;
type ChallengeOptions = { required: boolean; worldName: string };
type ChallengeState = { key: string; value: TopicChallenge | null };

export async function loadLabChallenge(track: LabTrack, topic: ChallengeTopic, options: ChallengeOptions) {
  const catalog = await import("../challenges");
  return track === "python"
    ? catalog.buildPythonChallenge(topic as PythonTopic, options)
    : catalog.buildSQLChallenge(topic as SQLTopic, options);
}

export function useLabChallenge({ enabled, track, topic, options }: {
  enabled: boolean;
  track: LabTrack | null;
  topic: ChallengeTopic | null;
  options: ChallengeOptions;
}) {
  const { required, worldName } = options;
  const key = track && topic ? `${track}:${topic.title}:${required}:${worldName}` : "";
  const [state, setState] = useState<ChallengeState>({ key: "", value: null });

  useEffect(() => {
    if (!enabled || !track || !topic) return;
    let cancelled = false;
    void loadLabChallenge(track, topic, { required, worldName })
      .then((value) => {
        if (!cancelled) setState({ key, value });
      })
      .catch(() => {
        if (!cancelled) setState({ key, value: null });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, key, required, topic, track, worldName]);

  return state.key === key ? state.value : null;
}
