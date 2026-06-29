import { ClassificationResultPage } from "@/components/dashboard/pages/ClassificationResultPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ClassificationResultPage id={id} />;
}
