import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import prisma from "@/app/api/_db/db";
import { authOptions } from "@/authOptions";
import { getOrder } from "@/app/api/_utils/payments";
import { areDatesClose } from "@/lib/utils/dateUtils";

const getOrderSubscriptionId = async (
  orderCreatedAt: Date,
  userId: string,
): Promise<string | undefined> => {
  const latestSubscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
  if (
    latestSubscription &&
    areDatesClose(new Date(orderCreatedAt), latestSubscription.startDate, 5)
  ) {
    return latestSubscription.subscriptionId;
  }
};

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const order = await getOrder(params.orderId);

    const latestSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.userId },
      orderBy: { startDate: "desc" },
    });
    const subscriptionId = await getOrderSubscriptionId(
      new Date(order.create_time),
      session.user.userId,
    );

    if (subscriptionId) {
      // set "cancelled" to status
      await prisma.subscription.update({
        where: {
          subscriptionId: subscriptionId,
        },
        data: {
          status: "CANCELLED",
        },
      });
    } else {
      await prisma.userOrders.update({
        where: {
          orderId: params.orderId,
        },
        data: {
          status: "CANCELLED",
        },
      });
    }
    return NextResponse.json({}, { status: 200 });
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
