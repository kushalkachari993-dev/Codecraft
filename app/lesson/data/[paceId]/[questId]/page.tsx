import DataApp from "../../../../data/data-app";
import { DATA_PATHS, DATA_PATH_TOTAL, isDataPaceId } from "../../../../data/track";
export function generateStaticParams() { return DATA_PATHS.flatMap(({ id: paceId }) => Array.from({ length: DATA_PATH_TOTAL }, (_, index) => ({ paceId, questId: String(index + 1) }))); }
export default async function DataLessonPage({ params }: { params: Promise<{ paceId: string; questId: string }> }) { const { paceId, questId } = await params; return <DataApp paceId={isDataPaceId(paceId) ? paceId : "beginner"} lessonId={Number.parseInt(questId, 10)} />; }
