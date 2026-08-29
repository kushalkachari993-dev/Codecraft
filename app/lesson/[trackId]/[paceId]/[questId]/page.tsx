import { CodeCraftApp } from "../../../../learning-app";
import { TRACK_TOPIC_TOTALS } from "../../../../track-catalog";

export function generateStaticParams() {
  return Object.entries(TRACK_TOPIC_TOTALS).flatMap(([trackId, paces]) =>
    Object.entries(paces).flatMap(([paceId, total]) =>
      Array.from({ length: total }, (_, index) => ({ trackId, paceId, questId: String(index + 1) })),
    ),
  );
}

export default async function LessonPage({ params }: { params: Promise<{ trackId: string; paceId: string; questId: string }> }) {
  const { trackId, paceId, questId } = await params;
  return <CodeCraftApp initialPath={`/lesson/${trackId}/${paceId}/${questId}`} />;
}
