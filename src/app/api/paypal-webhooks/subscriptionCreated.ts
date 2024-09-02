import { NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "@/loggerServer";
import { CreateSubscriptionBody, PayPalEventResponse } from "@/models/payment";

export async function handleSubscriptionCreated(
  event: PayPalEventResponse,
): Promise<NextResponse>;
export async function handleSubscriptionCreated(data: CreateSubscriptionBody): Promise<NextResponse>;

export async function handleSubscriptionCreated(data: any) {
  try {
    let planId = data.planId;
    let subscriptionId = data.subscriptionId;
    let startDate = data.startDate;
    let status = data.status;

    // check if the data is coming from the webhook event (PayPalEventResponse)
    if (data.id) {
      planId = data.resource.plan_id;
      subscriptionId = data.resource.id;
      startDate = new Date(data.resource.start_time);
      status = data.resource.status;
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { subscriptionId },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { message: "Subscription already exists", existingSubscription },
        { status: 200 },
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        planId,
        subscriptionId,
        startDate,
        status,
      },
    });
    return NextResponse.json(
      { message: "Subscription created successfully", subscription },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error handling subscription created", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Failed to handle subscription created" },
      { status: 500 },
    );
  }
}
