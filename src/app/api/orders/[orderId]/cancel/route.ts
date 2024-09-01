import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/_db/db";
import { authOptions } from "@/authOptions";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.userOrders.update({
      where: {
        orderId: params.orderId,
      },
      data: {
        status: "CANCELLED",
      },
    });

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
