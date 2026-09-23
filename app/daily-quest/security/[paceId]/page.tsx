import SecurityApp from "../../../security/security-app";
import { SECURITY_PATHS, isSecurityPaceId } from "../../../security/track";
export function generateStaticParams() { return SECURITY_PATHS.map(({ id: paceId }) => ({ paceId })); }
export default async function SecurityDailyQuestPage({ params }: { params: Promise<{ paceId: string }> }) { const { paceId } = await params; return <SecurityApp paceId={isSecurityPaceId(paceId) ? paceId : "beginner"} daily />; }
