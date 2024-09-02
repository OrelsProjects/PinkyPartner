import { NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { PayPalEventResponse } from "../../../models/payment";
import { handleSubscriptionCreated } from "./subscriptionCreated";

export async function handleSubscriptionActivated(data: {
  subscriptionId: string;
  email_address: string;
  nextBillingDate: Date;
  lastPaymentDate: Date;
  lastPaymentAmount: number;
  planId: string;
  startDate: Date;
  status: string;
}): Promise<NextResponse>;
export async function handleSubscriptionActivated(
  data: PayPalEventResponse,
): Promise<NextResponse>;
export async function handleSubscriptionActivated(
  data: any,
): Promise<NextResponse> {
  let subscriptionId = data.subscriptionId;
  let email_address = data.email_address;
  let nextBillingDate = data.nextBillingDate;
  let lastPaymentDate = data.lastPaymentDate;
  let lastPaymentAmount = data.lastPaymentAmount;

  if (data.id) {
    subscriptionId = data.resource.id;
    email_address = data.resource.subscriber.email_address;
    nextBillingDate = new Date(data.resource.billing_info.next_billing_time);
    lastPaymentDate = new Date(data.resource.billing_info.last_payment.time);
    lastPaymentAmount = parseFloat(
      data.resource.billing_info.last_payment.amount.value,
    );
  }

  const user = await prisma.appUser.findFirst({
    where: { email: email_address },
  });

  if (!user) {
    Logger.error("User not found", "system-webhook", {
      data: { email_address },
    });
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { subscriptionId },
  });

  if (!existingSubscription) {
    await handleSubscriptionCreated(data);
  }

  try {
    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        userId: user.id,
        status: "active",
        nextBillingDate,
        lastPaymentDate,
        lastPaymentAmount,
      },
    });
    return NextResponse.json(
      { message: "Subscription activated successfully", subscriptionUpdate },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error handling subscription activated", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Failed to handle subscription activated" },
      { status: 500 },
    );
  }
}
