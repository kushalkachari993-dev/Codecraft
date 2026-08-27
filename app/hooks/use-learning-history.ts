"use client";

import { useEffect, useRef } from "react";
import { learningPathForState, parseLearningLocation, type LearningPaceId, type LearningRoute, type LearningTrackId, type LearningView } from "../navigation";

type LearningHistoryOptions = {
  routeReady: boolean;
  view: LearningView;
  trackId: LearningTrackId;
  paceId: LearningPaceId;
  questId: number;
  dailyQuestMode: boolean;
  profileOpen: boolean;
  initialProfileOpen: boolean;
  onRouteChange: (route: LearningRoute) => void;
};

export function useLearningHistory({
  routeReady,
  view,
  trackId,
  paceId,
  questId,
  dailyQuestMode,
  profileOpen,
  initialProfileOpen,
  onRouteChange,
}: LearningHistoryOptions) {
  const routeHandlerRef = useRef(onRouteChange);
  const historyInitializedRef = useRef(false);
  const previousProfileOpenRef = useRef(initialProfileOpen);

  useEffect(() => {
    routeHandlerRef.current = onRouteChange;
  }, [onRouteChange]);

  useEffect(() => {
    const handlePopState = () => {
      routeHandlerRef.current(parseLearningLocation(window.location.pathname + window.location.search));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!routeReady) return;

    const desiredPath = learningPathForState({
      view,
      trackId,
      paceId,
      questId,
      dailyQuestMode,
      profileOpen,
    });
    const currentPath = window.location.pathname + window.location.search;
    const wasProfileOpen = previousProfileOpenRef.current;
    previousProfileOpenRef.current = profileOpen;

    if (wasProfileOpen && !profileOpen && window.location.pathname === "/profile") {
      const profileOrigin = window.history.state?.codecraftProfileOrigin;
      if (typeof profileOrigin === "string" && profileOrigin !== currentPath) {
        window.history.back();
      } else {
        window.history.replaceState({ codecraft: true }, "", desiredPath);
      }
      return;
    }

    if (!historyInitializedRef.current) {
      window.history.replaceState({ codecraft: true }, "", desiredPath);
      historyInitializedRef.current = true;
      return;
    }

    if (currentPath === desiredPath) return;
    const historyState = desiredPath === "/profile"
      ? { codecraft: true, codecraftProfileOrigin: currentPath }
      : { codecraft: true };
    window.history.pushState(historyState, "", desiredPath);
  }, [dailyQuestMode, paceId, profileOpen, questId, routeReady, trackId, view]);
}
