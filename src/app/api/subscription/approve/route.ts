import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { OnApproveData } from "@/models/payment";
import { getSubscription, verifyResponse } from "../../_utils/payments";
import { handleSubscriptionCreated } from "../../paypal-webhooks/subscriptionCreated";
import { handleSubscriptionActivated } from "../../paypal-webhooks/subscriptionActivated";

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
    if (data.subscriptionID) {
      const subscriptionData = await getSubscription(data.subscriptionID);

      const responseCreate = await handleSubscriptionCreated({
        status: subscriptionData.status,
        subscriptionId: data.subscriptionID,
        startDate: new Date(subscriptionData.start_time),
        planId: subscriptionData.plan_id,
      });

      if (responseCreate.status !== 200) {
        return responseCreate;
      }

      const responseActivate = await handleSubscriptionActivated({
        subscriptionId: data.subscriptionID,
        email_address: subscriptionData.subscriber.email_address,
        nextBillingDate: new Date(
          subscriptionData.billing_info.next_billing_time,
        ),
        lastPaymentDate: new Date(
          subscriptionData.billing_info.last_payment.time,
        ),
        lastPaymentAmount: parseFloat(
          subscriptionData.billing_info.last_payment.amount.value,
        ),
        planId: subscriptionData.plan_id,
        startDate: new Date(subscriptionData.start_time),
        status: subscriptionData.status,
      });
      if (responseActivate.status !== 200) {
        return responseActivate;
      }
    }

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
