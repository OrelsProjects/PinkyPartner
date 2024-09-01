"use client";

import React from "react";
import Plan from "./plan";
import { useCustomRouter } from "@/lib/hooks/useCustomRouter";
import { PlanId } from "@/models/payment";

export default function PricingPage() {
  const router = useCustomRouter();

  return (
    <div className="flex flex-col justify-center items-center md:flex-row-reverse md:justify-end md:items-center gap-4">
      <Plan
        planName="Supportive Pinker"
        pricePlanPrimary={{
          id: process.env.NEXT_PUBLIC_PLAN_ID_ANNUAL || "",
          price: 19,
          interval: "year",
        }}
        pricePlanSecondary={{
          id: process.env.NEXT_PUBLIC_PLAN_ID_MONTH || "",
          price: 2,
          interval: "month",
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
