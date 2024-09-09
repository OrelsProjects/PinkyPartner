"use client";

import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import usePayments from "@/lib/hooks/usePayments";
import { OnApproveData } from "@/models/payment";
import PaymentButtons from "../paymentButtons";
import { Logger } from "@/logger";

export default function PaymentPage({
  params,
}: {
  params: { planId: string };
}) {
  const [error, setError] = React.useState<string | null>(null);
  const {
    approveOrder,
    cancelOrder,
    createOrder,
    approveSubscription,
    createSubscription,
  } = usePayments();

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

  const handleCreateOrder = async () => await createOrder(params.planId, 1);

  const handleCreateSubscription = async (subscriptionId: string) =>
    await createSubscription(subscriptionId);

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
        subscription={isSubscription ? { planId: params.planId } : undefined}
        style={{
          color: "gold",
          shape: "rect",
          layout: "vertical",
          label: isSubscription ? "subscribe" : "pay",
          height: 40,
        }}
        createSubscription={async (data, actions) => {
          const subscriptionId = await actions.subscription.create({
            plan_id: params.planId,
          });
          await handleCreateSubscription(subscriptionId);
          return subscriptionId;
        }}
        createOrder={async (data, actions) => {
          const order = await handleCreateOrder();
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
      />
      <div className="flex flex-col gap-5">
        <span className="text-xl text-destructive">{error}</span>
      </div>
    </div>
  );
}
