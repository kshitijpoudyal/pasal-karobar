import {
  Home,
  Scissors,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import {
  TimelineDateDivider,
  TransactionActivityCard,
} from "@/features/activity/components/transaction-activity-card";

export function TransactionTimeline() {
  return (
    <div className="flex flex-col gap-6">
      <TimelineDateDivider label="Today, 24th Oct" />
      <div className="grid grid-cols-1 gap-6">
        <TransactionActivityCard
          title="Standard Haircut + Beard"
          time="10:45 AM"
          paymentLabel="Cash"
          paymentClassName="bg-secondary-container/50 text-on-secondary-container"
          amountLabel="Amount / Tip"
          amount={
            <>
              <span className="text-secondary">रू 800</span>{" "}
              <span className="text-sm font-normal text-on-surface-variant">
                + रू 150
              </span>
            </>
          }
          icon={Scissors}
          iconWrapClassName="bg-secondary-container text-on-secondary-container"
          borderClassName="border-l-secondary"
        />
        <TransactionActivityCard
          title="Shaving Cream & Blades"
          time="09:15 AM"
          paymentLabel="eSewa"
          paymentClassName="bg-surface-container-high text-tertiary"
          amountLabel="Expense"
          amount={<span className="text-tertiary">- रू 2,400</span>}
          icon={ShoppingCart}
          iconWrapClassName="bg-surface-container-high text-tertiary"
          borderClassName="border-l-tertiary"
        />
        <TransactionActivityCard
          title="Royal Grooming Package"
          time="08:30 AM"
          paymentLabel="FonePay"
          paymentClassName="bg-secondary-container/50 text-on-secondary-container"
          amountLabel="Amount / Tip"
          amount={
            <>
              <span className="text-secondary">रू 2,500</span>{" "}
              <span className="text-sm font-normal text-on-surface-variant">
                + रू 500
              </span>
            </>
          }
          icon={Sparkles}
          iconWrapClassName="bg-secondary-container text-on-secondary-container"
          borderClassName="border-l-secondary"
        />
      </div>

      <TimelineDateDivider label="Yesterday, 23rd Oct" />
      <div className="mb-24 grid grid-cols-1 gap-6">
        <TransactionActivityCard
          title="Monthly Shop Rent"
          time="04:00 PM"
          paymentLabel="Bank Transfer"
          paymentClassName="bg-surface-container-high text-tertiary"
          amountLabel="Expense"
          amount={<span className="text-tertiary">- रू 15,000</span>}
          icon={Home}
          iconWrapClassName="bg-surface-container-high text-tertiary"
          borderClassName="border-l-tertiary"
        />
      </div>
    </div>
  );
}
