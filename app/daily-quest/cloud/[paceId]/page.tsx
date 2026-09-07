import { notFound } from "next/navigation";
import CloudApp from "../../../cloud/cloud-app";
import { CLOUD_PATHS, isCloudPaceId } from "../../../cloud/track";

export function generateStaticParams() {
  return CLOUD_PATHS.map((path) => ({ paceId: path.id }));
}

export default async function CloudDailyQuestPage({ params }: { params: Promise<{ paceId: string }> }) {
  const { paceId } = await params;
  if (!isCloudPaceId(paceId)) notFound();
  return <CloudApp paceId={paceId} daily />;
}
