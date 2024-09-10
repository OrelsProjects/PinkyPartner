import { NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "../../../loggerServer";
import { PayPalEventResponse } from "@/models/payment";

export async function handlePaymentFailed(event: PayPalEventResponse) {
  try {
    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId: event.resource.id },
      data: {
        status: "payment_failed", // Update status to reflect payment failure
      },
    });
    return NextResponse.json(
      { message: "Payment failed, subscription updated", subscriptionUpdate },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error handling payment failed", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Failed to handle payment failed" },
      { status: 500 },
    );
  }
}
