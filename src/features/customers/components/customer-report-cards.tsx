import {
  EMPTY_CUSTOMER_PERIOD_INSIGHTS,
  type CustomerPeriodInsights,
} from "@/services/customer-analytics.service";

type CustomerReportCardsProps = {
  insights: CustomerPeriodInsights;
  periodLabel?: string;
};

export function CustomerReportCards({
  insights,
  periodLabel = "This week",
}: CustomerReportCardsProps) {
  const stats = { ...EMPTY_CUSTOMER_PERIOD_INSIGHTS, ...insights };
  const cards = [
    { label: "New customers", value: stats.newCustomers },
    { label: "Returning", value: stats.returningCustomers },
    { label: "Unique tracked", value: stats.uniqueTrackedCustomers },
    { label: "Anonymous visits", value: stats.anonymousVisits },
  ];

  return (
    <section className="space-y-3">
      <p className="text-label-sm text-on-surface-variant">{periodLabel}</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
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
      </div>
    </section>
  );
}
