export interface CodeCraftEnvironment {
  CODECRAFT_AI_MODEL?: string;
  CODECRAFT_AI_REVIEW_DAILY_LIMIT?: string;
  CODECRAFT_GENAI_REQUESTS_PER_MINUTE?: string;
  CODECRAFT_ADMIN_USER_IDS?: string;
  CODECRAFT_ADMIN_EMAILS?: string;
  CODECRAFT_TEMP_ADMIN_PASSCODE?: string;
  CODECRAFT_TEMP_ADMIN_SESSION_SECRET?: string;
}

export interface ServerConfig {
  aiModel: string;
  aiReviewDailyLimit: number;
  genAiRequestsPerMinute: number;
}

const DEFAULT_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";

function boundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

export function getServerConfig(environment: CodeCraftEnvironment): ServerConfig {
  return {
    aiModel: environment.CODECRAFT_AI_MODEL?.trim() || DEFAULT_AI_MODEL,
    aiReviewDailyLimit: boundedInteger(environment.CODECRAFT_AI_REVIEW_DAILY_LIMIT, 3, 1, 100),
    genAiRequestsPerMinute: boundedInteger(environment.CODECRAFT_GENAI_REQUESTS_PER_MINUTE, 12, 1, 120),
  };
}
