import { CodeCraftApp } from "../page";

export default async function DailyQuestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const track = typeof query.track === "string" ? query.track : "";
  const pace = typeof query.pace === "string" ? query.pace : "";
  const initialPath = "/daily-quest?track=" + encodeURIComponent(track) + "&pace=" + encodeURIComponent(pace);
  return <CodeCraftApp initialPath={initialPath} />;
}
