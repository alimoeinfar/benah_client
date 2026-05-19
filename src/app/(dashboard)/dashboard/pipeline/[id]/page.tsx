import { RunOutputsPage } from "@/components/dashboard/pages/RunOutputsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RunOutputsPage runId={Number(id)} />;
}
