import { CodeCraftApp } from "../page";

export default async function LessonPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const track = typeof query.track === "string" ? query.track : "";
  const pace = typeof query.pace === "string" ? query.pace : "";
  const quest = typeof query.quest === "string" ? query.quest : "";
  const initialPath = "/lesson?track=" + encodeURIComponent(track) + "&pace=" + encodeURIComponent(pace) + "&quest=" + encodeURIComponent(quest);
  return <CodeCraftApp initialPath={initialPath} />;
}
