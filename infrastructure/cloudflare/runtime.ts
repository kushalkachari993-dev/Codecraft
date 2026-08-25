import { env } from "cloudflare:workers";
import { D1AnalyticsRepository } from "./d1-analytics-repository";
import { D1ProgressRepository } from "./d1-progress-repository";
import type { CloudflareApplicationEnvironment } from "./environment";

let progressRepository: D1ProgressRepository | null = null;
let analyticsRepository: D1AnalyticsRepository | null = null;

export function getCloudflareEnvironment() {
  return env as unknown as CloudflareApplicationEnvironment;
}

export function getProgressRepository() {
  if (!progressRepository) {
    const environment = getCloudflareEnvironment();
    if (!environment.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
    progressRepository = new D1ProgressRepository(environment.DB);
  }
  return progressRepository;
}

export function getAnalyticsRepository() {
  if (!analyticsRepository) {
    const environment = getCloudflareEnvironment();
    if (!environment.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
    analyticsRepository = new D1AnalyticsRepository(environment.DB);
  }
  return analyticsRepository;
}
