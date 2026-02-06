import { notFound } from "next/navigation";
import { DealDetailView } from "@/app/components/DealDetailView";
import { getCompanyById } from "@/app/lib/mock";

export default function DealPage({
  params,
}: {
  params: { id: string };
}) {
  const company = getCompanyById(params.id);
  if (!company) notFound();
  return (
    <main className="min-h-dvh">
      <DealDetailView company={company} />
    </main>
  );
}

