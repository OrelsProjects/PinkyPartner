import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { captureOrder } from "@/app/api/_utils/payments";
import prisma from "@/app/api/_db/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { orderId } = params;

    const captureResponse = await captureOrder(orderId);
    const isCaptureSuccessful = !captureResponse?.details?.[0]?.issue;

    if (isCaptureSuccessful) {
      await prisma.userOrders.update({
        where: {
          orderId,
        },
        data: {
          status: captureResponse.status,
        },
      });

      // THE DEAL WAS COMPLETED. RUN YOUR LOGIC HERE.
    }

    return NextResponse.json(captureResponse, { status: 200 });
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
