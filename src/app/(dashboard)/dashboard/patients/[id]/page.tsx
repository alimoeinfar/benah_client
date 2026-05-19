import { PatientDetailPage } from "@/components/dashboard/pages/PatientDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailPage patientId={Number(id)} />;
}
