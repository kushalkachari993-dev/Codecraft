import BackendApp from "../../../backend/backend-app";
import { BACKEND_PATHS, isBackendPaceId } from "../../../backend/track";

export function generateStaticParams() {
  return BACKEND_PATHS.map(({ id: paceId }) => ({ paceId }));
}

export default async function BackendDailyQuestPage({ params }: { params: Promise<{ paceId: string }> }) {
  const { paceId } = await params;
  return <BackendApp paceId={isBackendPaceId(paceId) ? paceId : "beginner"} daily />;
}
