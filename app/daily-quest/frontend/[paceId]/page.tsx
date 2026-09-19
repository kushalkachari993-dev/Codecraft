import FrontendApp from "../../../frontend/frontend-app";
import { FRONTEND_PATHS, isFrontendPaceId } from "../../../frontend/track";
export function generateStaticParams() { return FRONTEND_PATHS.map(({ id: paceId }) => ({ paceId })); }
export default async function FrontendDailyQuestPage({ params }: { params: Promise<{ paceId: string }> }) { const { paceId } = await params; return <FrontendApp paceId={isFrontendPaceId(paceId) ? paceId : "beginner"} daily />; }
