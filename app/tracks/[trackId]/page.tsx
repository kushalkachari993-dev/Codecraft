import { CodeCraftApp } from "../../learning-app";

const TRACKS = ["python", "genai", "sql"] as const;

export function generateStaticParams() {
  return TRACKS.map((trackId) => ({ trackId }));
}

export default async function TrackPacePage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  return <CodeCraftApp initialPath={`/tracks/${trackId}`} />;
}
