import { EXPERT_CLOUD_LESSONS, INTERMEDIATE_CLOUD_LESSONS } from "./advanced-curriculum";
import { CLOUD_LESSONS } from "./curriculum";
import { BEGINNER_CLOUD_EXTENSION, EXPERT_CLOUD_EXTENSION, INTERMEDIATE_CLOUD_EXTENSION } from "./extended-curriculum";
import type { CloudLesson } from "./model";
import type { CloudPaceId } from "./track";

export const CLOUD_CURRICULA: Record<CloudPaceId, CloudLesson[]> = {
  beginner: [...CLOUD_LESSONS, ...BEGINNER_CLOUD_EXTENSION],
  intermediate: [...INTERMEDIATE_CLOUD_LESSONS, ...INTERMEDIATE_CLOUD_EXTENSION],
  expert: [...EXPERT_CLOUD_LESSONS, ...EXPERT_CLOUD_EXTENSION],
};

export function getCloudLessons(paceId: CloudPaceId) {
  return CLOUD_CURRICULA[paceId];
}

export function getCloudLesson(paceId: CloudPaceId, id: number) {
  return getCloudLessons(paceId).find((lesson) => lesson.id === id);
}
