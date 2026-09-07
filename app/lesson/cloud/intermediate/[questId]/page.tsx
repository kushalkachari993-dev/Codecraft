import { notFound } from "next/navigation";
import CloudApp from "../../../../cloud/cloud-app";
import { CLOUD_PATH_TOTAL } from "../../../../cloud/track";

export function generateStaticParams() {
  return Array.from({ length: CLOUD_PATH_TOTAL }, (_, index) => ({ questId: String(index + 1) }));
}

export default async function CloudIntermediateLessonPage({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  const id = Number(questId);
  if (!/^[0-9]+$/.test(questId) || !Number.isInteger(id) || id < 1 || id > CLOUD_PATH_TOTAL) notFound();
  return <CloudApp paceId="intermediate" lessonId={id} />;
}
