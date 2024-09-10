import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { OnApproveData } from "@/models/payment";
import { getSubscription, verifyResponse } from "@/app/api/_utils/payments";
import { handleSubscriptionCreated } from "@/app/api/paypal-webhooks/subscriptionCreated";
import { handleSubscriptionActivated } from "@/app/api/paypal-webhooks/subscriptionActivated";
import prisma from "@/app/api/_db/db";
import { UserPaidStatusEnum } from "@/models/appUser";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { data }: { data: OnApproveData } = await req.json();
    const isVerified = await verifyResponse(data);

    if (!isVerified) {
      Logger.error("Failed to verify response", session.user.userId, {
        data: { data },
      });
      return NextResponse.json(
        { error: "Failed to verify response" },
        { status: 401 },
      );
    }

    const subscriptionId = data.subscriptionID;

    if (subscriptionId) {
      const subscriptionData = await getSubscription(subscriptionId);

      const responseCreate = await handleSubscriptionCreated({
        status: subscriptionData.status,
        subscriptionId: subscriptionId,
        startDate: new Date(subscriptionData.start_time),
        planId: subscriptionData.plan_id,
      });

      if (responseCreate.status !== 200) {
        return responseCreate;
      }

      const next_billing_time =
        subscriptionData.billing_info?.next_billing_time;
      const last_payment = subscriptionData.billing_info?.last_payment;

      const responseActivate = await handleSubscriptionActivated({
        subscriptionId: subscriptionId,
        userId: session.user.userId,
        nextBillingDate: next_billing_time ? new Date(next_billing_time) : null,
        lastPaymentDate: last_payment ? new Date(last_payment.time) : null,
        lastPaymentAmount: last_payment?.amount?.value
          ? parseFloat(last_payment.amount.value)
          : null,
        planId: subscriptionData.plan_id,
        startDate: new Date(subscriptionData.start_time),
        status: subscriptionData.status,
      });

      if (responseActivate.status !== 200) {
        return responseActivate;
      }
    }

    await prisma.appUserMetadata.update({
      where: { userId: session.user.userId },
      data: {
        paidStatus: UserPaidStatusEnum.Premium,
      },
    });

    return NextResponse.json(
      {
        id: data.subscriptionID,
      },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error sending notification", session.user.userId, {
      data: { error },
    });
    return NextResponse.json(
      { error: "Error sending notification" },
      { status: 500 },
    );
  }
}
