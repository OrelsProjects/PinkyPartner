import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../authOptions";
import prisma from "../_db/db";
import { Contract, Obligation } from "@prisma/client";
import { messaging } from "../../../../firebase.config.admin";
import { NotificationData } from "../../../lib/features/notifications/notificationsSlice";

interface SendNotificationBody {
  contract: Contract;
  obligation: Obligation;
  userId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const {
      title,
      body,
      image,
      userId,
    }: NotificationData & { userId: string } = await req.json();
    const user = await prisma.appUserMetadata.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const token = user.pushToken;

    if (!token) {
      return NextResponse.json(
        { error: "User not subscribed to notifications" },
        { status: 400 },
      );
    }
    const message = {
      notification: {
        title,
        body,
        image,
      },
      token,
    };
    const imageUrl = process.env.LOGO_URL;
    if (imageUrl && !message.notification.image) {
      message.notification.image = imageUrl;
    }

    await messaging.send(message);

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    Logger.error("Error creating obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
