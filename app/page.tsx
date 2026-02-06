import { DashboardCards } from "@/app/components/DashboardCards";
import { companies, investorActivity, insights, news } from "@/app/lib/mock";

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <DashboardCards
        companies={companies}
        investorActivity={investorActivity}
        insights={insights}
        news={news}
      />
    </main>
  );
}
