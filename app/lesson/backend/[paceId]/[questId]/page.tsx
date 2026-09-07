import BackendApp from "../../../../backend/backend-app";
import { BACKEND_PATHS, BACKEND_PATH_TOTAL, isBackendPaceId } from "../../../../backend/track";

export function generateStaticParams() {
  return BACKEND_PATHS.flatMap(({ id: paceId }) => Array.from({ length: BACKEND_PATH_TOTAL }, (_, index) => ({ paceId, questId: String(index + 1) })));
}

export default async function BackendLessonPage({ params }: { params: Promise<{ paceId: string; questId: string }> }) {
  const { paceId, questId } = await params;
  return <BackendApp paceId={isBackendPaceId(paceId) ? paceId : "beginner"} lessonId={Number.parseInt(questId, 10)} />;
}
