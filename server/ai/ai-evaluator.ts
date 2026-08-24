export interface AiEvaluationRequest {
  topic: string;
  learningGoal: string;
  successCriteria: string[];
  submission: string;
}

export interface AiEvaluationResult {
  feedback: string;
}

/** Model-evaluation port. Implementations may use Workers AI or another provider. */
export interface AiEvaluator {
  readonly available: boolean;
  evaluate(request: AiEvaluationRequest): Promise<AiEvaluationResult>;
}
