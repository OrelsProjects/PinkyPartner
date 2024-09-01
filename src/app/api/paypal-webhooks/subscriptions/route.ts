// pages/api/paypal-webhooks.ts

import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../../loggerServer";
import { PayPalEventResponse } from "../../../../models/payment";
import { handleSubscriptionCreated } from "../subscriptionCreated";
import { handlePaymentFailed } from "../paymentFailed";
import { handlePaymentSaleCompleted } from "../paymentSaleCompleted";
import { handleSubscriptionActivated } from "../subscriptionActivated";
import { handleSubscriptionCancelled } from "../subscriptionCancelled";
import { handleSubscriptionSuspended } from "../subscriptionSuspended";
import { verifyWebhookSignature } from "../../_utils/payments";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const eventType = event.event_type;
    Logger.info("Received webhook event", "system-webhook", {
      data: { eventType, event },
    });

    const isHookVerified = await verifyWebhookSignature(req.headers, event);
    if (!isHookVerified) {
      Logger.error("Webhook signature verification failed", "system-webhook", {
        data: { event },
      });
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 401 },
      );
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        return await handleSubscriptionCreated(event);
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        return await handleSubscriptionActivated(event);
      case "PAYMENT.SALE.COMPLETED":
        return await handlePaymentSaleCompleted(event);
      case "BILLING.SUBSCRIPTION.CANCELLED":
        return await handleSubscriptionCancelled(event);
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        return await handlePaymentFailed(event);
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        return await handleSubscriptionSuspended(event);
      default:
        Logger.info("Unhandled event type", "system-webhook", {
          data: { event },
        });
        return NextResponse.json({}, { status: 200 });
    }
  } catch (error) {
    Logger.error("Error processing webhook", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}
