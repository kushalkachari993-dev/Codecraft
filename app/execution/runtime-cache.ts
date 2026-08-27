const RUNTIME_CACHE_WORKER_URL = "/runtime-cache-worker.js";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

let registrationPromise: Promise<ServiceWorkerRegistration | undefined> | null = null;

export function shouldPrewarmRuntime() {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as NavigatorWithConnection).connection;
  return !connection?.saveData && connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g";
}

export function ensureRuntimeCacheWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve(undefined);
  registrationPromise ??= navigator.serviceWorker
    .register(RUNTIME_CACHE_WORKER_URL, { scope: "/" })
    .then(() => navigator.serviceWorker.ready)
    .catch(() => undefined);
  return registrationPromise;
}
