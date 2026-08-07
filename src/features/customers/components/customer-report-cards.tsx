import type { CustomerPeriodInsights } from "@/services/customer-analytics.service";

type CustomerReportCardsProps = {
  insights: CustomerPeriodInsights;
};

export function CustomerReportCards({ insights }: CustomerReportCardsProps) {
  const cards = [
    { label: "New customers", value: insights.newCustomers },
    { label: "Returning", value: insights.returningCustomers },
    { label: "Unique tracked", value: insights.uniqueTrackedCustomers },
    { label: "Anonymous visits", value: insights.anonymousVisits },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="squircle flex flex-col gap-2 bg-surface-container-low p-5 shadow-natural-ink lg:p-6"
        >
          <span className="text-label-sm text-on-surface-variant">
            {card.label}
          </span>
          <span className="font-headline text-2xl font-bold text-primary lg:text-3xl">
            {card.value}
          </span>
        </div>
      ))}
    </section>
  );
}
