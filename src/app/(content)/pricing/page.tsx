"use client";

import React, { useEffect } from "react";
import Plan from "./plan";
import { useCustomRouter } from "@/lib/hooks/useCustomRouter";
import { PlanId, SubscriptionPlans } from "@/models/payment";
import usePayments from "@/lib/hooks/usePayments";

export default function PricingPage() {
  const router = useCustomRouter();
  const { getSubscriptionPlans } = usePayments();
  const [plans, setPlans] = React.useState<SubscriptionPlans | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getSubscriptionPlans()
      .then(plans => {
        setPlans(plans);
      })
      .catch(error => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center md:flex-row-reverse md:justify-end md:items-center gap-4">
      <Plan
        loading={loading}
        planName="Supportive Pinker"
        pricePlanPrimary={{
          id: plans?.yearly.id || "",
          price:
            Number(
              plans?.yearly.billing_cycles?.[0]?.pricing_scheme?.fixed_price.value,
            ) || -1,
          interval:
            plans?.yearly.billing_cycles?.[0]?.frequency.interval_unit.toLowerCase() as
              | "month"
              | "year",
        }}
        pricePlanSecondary={{
          id: plans?.monthly.id || "",
          price:
            Number(
              plans?.monthly.billing_cycles?.[0]?.pricing_scheme?.fixed_price
                .value,
            ) || -1,
          interval:
            plans?.monthly.billing_cycles?.[0]?.frequency.interval_unit.toLowerCase() as
              | "month"
              | "year",
        }}
        recommended
        items={[
          { name: "Unlimited partners in contract" },
          { name: "Create unique challenges" },
          { name: "Daily reminders" },
          { name: "Future products discount" },
          { name: "Keep supporting me :)" },
        ]}
        onClick={(planId: PlanId) => {
          router.push(`/payment/${planId}`);
        }}
      />
      <Plan
        loading={loading}
        planName="Pro Pinker"
        pricePlanPrimary={{
          id: process.env.NEXT_PUBLIC_PLAN_ID_ONE_TIME || "",
          price: 30,
          interval: "one-time",
        }}
        items={[
          { name: "Unlimited partners in contract" },
          { name: "Create unique challenges" },
          { name: "Support me :)" },
        ]}
        onClick={(planId: PlanId) => {
          router.push(`/payment/${planId}`);
        }}
      />
    </div>
  );
}
