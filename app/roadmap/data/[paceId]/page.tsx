import DataApp from "../../../data/data-app";
import { DATA_PATHS, isDataPaceId } from "../../../data/track";
export function generateStaticParams() { return DATA_PATHS.map(({ id: paceId }) => ({ paceId })); }
export default async function DataRoadmapPage({ params }: { params: Promise<{ paceId: string }> }) { const { paceId } = await params; return <DataApp paceId={isDataPaceId(paceId) ? paceId : "beginner"} roadmap />; }
