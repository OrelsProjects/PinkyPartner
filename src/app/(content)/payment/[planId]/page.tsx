"use client";

import React, { useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import usePayments from "@/lib/hooks/usePayments";
import { OnApproveData, PayPalSubscriptionPlan } from "@/models/payment";
import PaymentButtons from "../paymentButtons";
import { Logger } from "@/logger";

export default function PaymentPage({
  params,
}: {
  params: { planId: string };
}) {
  const [error, setError] = React.useState<string | null>(null);
  const { approveOrder, cancelOrder, createOrder, approveSubscription } =
    usePayments();

  useEffect(() => {
    if (error) {
      Logger.error("Error in payment page", { data: { error } });
      toast.error(error);
    }
  }, [error]);

  const isSubscription = useMemo(
    () => params.planId !== process.env.NEXT_PUBLIC_PLAN_ID_ONE_TIME,
    [],
  );

  const handleCreate = async () => await createOrder(params.planId, 1);

  const handleApproveOrder = async (data: OnApproveData, actions: any) => {
    if (data.subscriptionID) {
      return await approveSubscription(data);
    } else {
      const orderData = await approveOrder(data.orderID);
      const errorDetail = orderData?.details?.[0];
      if (errorDetail?.issue) {
        if (errorDetail.issue === "INSTRUMENT_DECLINED") {
          return actions.restart();
        } else if (errorDetail.issue === "PAYER_CANNOT_PAY") {
          throw new Error("Payer cannot pay");
        } else if (errorDetail) {
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PaymentButtons
        style={{
          color: "gold",
          shape: "pill",
          layout: "vertical",
          label: "pay",
          height: 40,
        }}
        createSubscription={async (data, actions) => {
          return actions.subscription.create({
            plan_id: params.planId,
          });
        }}
        createOrder={async (data, actions) => {
          const order = await handleCreate();
          return order;
        }}
        onApprove={async (data: OnApproveData, actions) => {
          setError(null);
          await handleApproveOrder(data, actions);
        }}
        onError={(err: any) => {
          setError(err.message);
        }}
        onCancel={async data => {
          if (data.orderID) {
            await cancelOrder(data.orderID as string);
          }
          setError(null);
        }}
        subscription={isSubscription ? { planId: params.planId } : undefined}
      />
      <div className="flex flex-col gap-5">
        <span className="text-xl text-destructive">{error}</span>
      </div>
    </div>
  );
}
