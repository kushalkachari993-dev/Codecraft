"use client";

import { useEffect } from "react";
import { learningPathForRoute, parseLearningLocation } from "./navigation";

export default function LegacyRouteRedirect() {
  useEffect(() => {
    const current = window.location.pathname + window.location.search;
    window.location.replace(learningPathForRoute(parseLearningLocation(current)));
  }, []);

  return <main className="app-shell"><div className="view-loading" role="status">Opening your CodeCraft mission…</div></main>;
}
