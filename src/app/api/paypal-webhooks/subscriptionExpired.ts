import { NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { PayPalEventResponse } from "@/models/payment";

export async function handleSubscriptionExpired(event: PayPalEventResponse) {
  try {
    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId: event.resource.id },
      data: {
        status: "expired",
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
