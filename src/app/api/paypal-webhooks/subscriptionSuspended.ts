import { NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { PayPalEventResponse } from "@/models/payment";
import { UserPaidStatusEnum } from "@/models/appUser";

export async function handleSubscriptionSuspended(event: PayPalEventResponse) {
  try {
    const subscriptionUpdate = await prisma.subscription.update({
      where: { subscriptionId: event.resource.id },
      data: {
        status: "suspended",
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { subscriptionId: event.resource.id },
      include: {
        appUser: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (subscription?.appUser) {
      await prisma.appUserMetadata.update({
        where: {
          userId: subscription.appUser.userId,
        },
        data: {
          paidStatus: UserPaidStatusEnum.Suspended,
        },
      });
    }

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
