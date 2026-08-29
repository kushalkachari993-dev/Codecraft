import { CodeCraftApp } from "../../../learning-app";

const TRACKS = ["python", "genai", "sql"] as const;
const PACES = ["beginner", "intermediate", "expert"] as const;

export function generateStaticParams() {
  return TRACKS.flatMap((trackId) => PACES.map((paceId) => ({ trackId, paceId })));
}

export default async function RoadmapPage({ params }: { params: Promise<{ trackId: string; paceId: string }> }) {
  const { trackId, paceId } = await params;
  return <CodeCraftApp initialPath={`/roadmap/${trackId}/${paceId}`} />;
}
