"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import usePayments from "@/lib/hooks/usePayments";
import {
  OnApproveData,
  PayPalCapture,
  PayPalSubscription,
  PayPalSubscriptionPlan,
} from "@/models/payment";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import PaymentButtons from "../paymentButtons";
import { Logger } from "@/logger";

export default function PaymentPage({
  params,
}: {
  params: { planId: string };
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [plans, setPlans] = React.useState<PayPalSubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState<boolean>(false);
  const { approveOrder, cancelOrder, createOrder, approveSubscription } =
    usePayments();

  const getPlans = async () => {
    if (loadingPlans) return;
    setLoadingPlans(true);
    try {
      const result = await axios.get<PayPalSubscription>(
        "/api/subscriptions/list",
      );
      const { data } = result;
      setPlans(data.plans);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingPlans(false);
      setError(null);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

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
      debugger;
      return await approveSubscription(data);
    } else {
      debugger;
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
          const sub = actions.subscription.create({
            plan_id: params.planId,
          });
          return sub;
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
      <Button asChild>
        <Link
          href={process.env.NEXT_PUBLIC_PAYPAL_CREATE_SUBSCRIPTION_URL || ""}
          target="_blank"
        >
          Create Subscription Plan
        </Link>
      </Button>
      <Button asChild>
        <Link
          href={process.env.NEXT_PUBLIC_PAYPAL_SEE_SUBSCRIPTIONS_URL || ""}
          target="_blank"
        >
          See Subscriptions
        </Link>
      </Button>
      <Button onClick={getPlans}>Get Plans</Button>
      <div className="flex flex-col gap-8 justify-center items-center">
        {loadingPlans ? (
          <Loading spinnerClassName="w-12 h-12" />
        ) : plans.length > 0 ? (
          plans.map((plan, index) => (
            <div key={index} className="flex flex-row gap-0.5">
              <span>{plan.name}: </span>
              <span>{plan.id}</span>
            </div>
          ))
        ) : (
          <div>No plans</div>
        )}
      </div>
    </div>
  );
}
