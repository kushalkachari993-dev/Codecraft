import { getCloudEvidenceExercise, type CloudEvidenceExercise } from "../cloud/evidence";
import type { CloudLesson } from "../cloud/model";
import type { BackendPaceId } from "./track";

// The evidence generator is intentionally shared with Cloud Engineering so both
// tracks teach the same logs → traces → timeline → diff → cost investigation loop.
export function getBackendEvidenceExercise(paceId: BackendPaceId, lesson: CloudLesson): CloudEvidenceExercise {
  return getCloudEvidenceExercise(paceId, lesson);
}
