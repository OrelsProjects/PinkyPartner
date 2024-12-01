import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { NotificationData } from "@/lib/models/notification";
import { sendNotification } from "@/app/api/_utils/notification";
import { PrismaClient } from "@prisma/client";

// This part should be exported into a separate file
const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let token = "";

  try {
    const {
      title,
      body,
      image,
      userIdToNotify,
      type,
    }: NotificationData & { userIdToNotify: string } = await req.json();

    const user = await prisma.appUser.findUnique({
      where: { userId: userIdToNotify },
      include: {
        meta: {
          select: {
            pushToken: true,
            pushTokenMobile: true,
          },
        },
        settings: {
          select: {
            showNotifications: true,
            soundEffects: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    token = user.meta?.pushToken || "";
    const mobileToken = user.meta?.pushTokenMobile || "";
    if (!token && !mobileToken) {
      return NextResponse.json(
        { error: "User not subscribed to notifications" },
        { status: 400 },
      );
    }

    const message = {
      title,
      body: body || null,
      image: image || null,
      type,
      fromName: session?.user.name || "",
      toUserId: userIdToNotify,
      link: null,
      fromUserId: session?.user.userId || null,
    };

    const tokens = {
      webToken: token,
      mobileToken,
    };

    await sendNotification(message, tokens);

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    console.error(
      "Error sending notification",
      session?.user.userId || "system",
      {
        data: { error, token },
      },
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
