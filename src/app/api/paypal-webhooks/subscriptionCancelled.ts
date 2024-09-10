import { NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { PayPalEventResponse } from "@/models/payment";
import { UserPaidStatusEnum } from "@/models/appUser";

export async function handleSubscriptionCancelled(event: PayPalEventResponse) {
  try {
    const existingSubscription = await prisma.subscription.findFirst({
      where: { subscriptionId: event.resource.id },
      include: {
        appUser: {
          select: { userId: true },
        },
      },
    });

    if (!existingSubscription || !existingSubscription.userId) {
      Logger.error("Subscription not found", "system-webhook", {
        data: { event },
      });
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId: event.resource.id },
      data: {
        status: event.resource.status,
      },
    });

    await prisma.appUserMetadata.update({
      where: { userId: existingSubscription.userId },
      data: {
        paidStatus: UserPaidStatusEnum.Free,
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
