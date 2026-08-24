export interface LearnerIdentity {
  userId: string;
  email: string;
  displayName: string;
}

export interface SubmissionInput {
  track: string;
  pace: string;
  topicId: number;
  topic: string;
  stage: "attempt" | "submitted";
  code: string;
  passed: boolean;
  score: number;
  feedback: unknown[];
}

export interface SubmissionFilter {
  track: string;
  pace: string;
}

export interface SubmissionSummary {
  submission_id: string;
  track: string;
  pace: string;
  topic_id: number;
  topic: string;
  stage: string;
  passed: number;
  score: number;
  created_at: number;
}

export interface AiReviewReservation {
  usageDate: string;
  count: number;
}

/** Persistence port used by application routes. Provider SDK types must not leak here. */
export interface ProgressRepository {
  syncLearner(user: LearnerIdentity): Promise<void>;
  loadProgress(userId: string): Promise<string | null>;
  saveProgress(user: LearnerIdentity, progressJson: string): Promise<number>;
  saveSubmission(user: LearnerIdentity, submission: SubmissionInput): Promise<number>;
  listSubmissions(userId: string, filter?: SubmissionFilter): Promise<SubmissionSummary[]>;
  deleteLearnerData(userId: string): Promise<void>;
  reserveAiReview(user: LearnerIdentity, dailyLimit: number): Promise<AiReviewReservation | null>;
  releaseAiReview(userId: string, usageDate: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
