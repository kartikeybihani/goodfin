import { notFound } from "next/navigation";
import { DealDetailView } from "@/app/components/DealDetailView";
import { getCompanyById } from "@/app/lib/mock";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) notFound();
  return (
    <main className="min-h-dvh">
      <DealDetailView company={company} />
    </main>
  );
}
