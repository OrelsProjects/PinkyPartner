import { NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { PayPalEventResponse } from "../../../models/payment";

export async function handleSubscriptionCancelled(event: PayPalEventResponse) {
  try {
    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId: event.resource.id },
      data: {
        status: event.resource.status,
      },
    });
    return NextResponse.json(
      { message: "Subscription cancelled successfully", subscriptionUpdate },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error handling subscription cancelled", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Failed to handle subscription cancelled" },
      { status: 500 },
    );
  }
}
