import { CodeCraftApp } from "../page";

export default async function TracksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const track = typeof query.track === "string" ? query.track : "";
  const pace = typeof query.pace === "string" ? query.pace : "";
  const params = new URLSearchParams();
  if (track) params.set("track", track);
  if (pace) params.set("pace", pace);
  const initialPath = params.size ? "/tracks?" + params.toString() : "/tracks";
  return <CodeCraftApp initialPath={initialPath} />;
}
