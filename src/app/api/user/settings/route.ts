import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/authOptions";
import AppUser, { AppUserSettings } from "@/models/appUser";
import Logger from "@/loggerServer";
import prisma from "@/app/api/_db/db";

export async function POST(req: NextRequest): Promise<any> {}

export async function PATCH(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: AppUser | null = null;
  try {
    if (!session.user?.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const newSettings: Partial<AppUserSettings> = await req.json();
    const now = new Date();
    const userSettings = await prisma.appUserSettings.findUnique({
      where: { userId: session.user?.userId },
    });

    if (userSettings?.updatedAt && userSettings.updatedAt > now) {
      return NextResponse.json(
        { error: "User settings are outdated" },
        { status: 400 },
      );
    }

    let updatedSettings: AppUserSettings = {
      showNotifications: true,
      soundEffects: true,
      dailyReminder: true,
    };

    if (userSettings) {
      updatedSettings = {
        showNotifications:
          newSettings.showNotifications || userSettings.showNotifications,
        soundEffects: newSettings.soundEffects || userSettings.soundEffects,
        dailyReminder: newSettings.dailyReminder || userSettings.dailyReminder,
      };
    }

    updatedSettings = {
      ...updatedSettings,
      ...newSettings,
    };

    await prisma.appUserSettings.upsert({
      where: { userId: session.user?.userId },
      update: {
        ...updatedSettings,
        updatedAt: now,
      },
      create: {
        userId: session.user?.userId,
        updatedAt: now,
        ...updatedSettings,
      },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating user", user || "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
