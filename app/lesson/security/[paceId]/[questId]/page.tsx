import SecurityApp from "../../../../security/security-app";
import { SECURITY_PATHS, SECURITY_PATH_TOTAL, isSecurityPaceId } from "../../../../security/track";
export function generateStaticParams() { return SECURITY_PATHS.flatMap(({ id: paceId }) => Array.from({ length: SECURITY_PATH_TOTAL }, (_, index) => ({ paceId, questId: String(index + 1) }))); }
export default async function SecurityLessonPage({ params }: { params: Promise<{ paceId: string; questId: string }> }) { const { paceId, questId } = await params; return <SecurityApp paceId={isSecurityPaceId(paceId) ? paceId : "beginner"} lessonId={Number.parseInt(questId, 10)} />; }
