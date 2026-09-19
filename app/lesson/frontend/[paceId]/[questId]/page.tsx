import FrontendApp from "../../../../frontend/frontend-app";
import { FRONTEND_PATHS, FRONTEND_PATH_TOTAL, isFrontendPaceId } from "../../../../frontend/track";
export function generateStaticParams() { return FRONTEND_PATHS.flatMap(({ id: paceId }) => Array.from({ length: FRONTEND_PATH_TOTAL }, (_, index) => ({ paceId, questId: String(index + 1) }))); }
export default async function FrontendLessonPage({ params }: { params: Promise<{ paceId: string; questId: string }> }) { const { paceId, questId } = await params; return <FrontendApp paceId={isFrontendPaceId(paceId) ? paceId : "beginner"} lessonId={Number.parseInt(questId, 10)} />; }
