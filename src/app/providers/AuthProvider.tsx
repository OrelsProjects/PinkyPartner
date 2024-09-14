/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import {
  selectAuth,
  setUser as setUserAction,
} from "@/lib/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { setUserEventTracker } from "@/eventTracker";
import { Logger, setUserLogger } from "@/logger";
import { useSession } from "next-auth/react";
import AppUser, { AppUserMetadata, AppUserSettings } from "@/models/appUser";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import useOnboarding from "@/lib/hooks/useOnboarding";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { data: session, status } = useSession();
  const { isOnboardingCompleted } = useOnboarding();

  const setUser = async (user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userId?: string | null;
    meta: Partial<AppUserMetadata>;
    settings: Partial<AppUserSettings>;
  }) => {
    try {
      if (!user) {
        dispatch(setUserAction(null));
        return;
      }
      const appUser: AppUser = {
        displayName: user?.name || null,
        email: user?.email || "",
        photoURL: user?.image || null,
        userId: user?.userId || "",
        meta: {
          referralCode: user?.meta?.referralCode || "",
          onboardingCompleted: user?.meta?.onboardingCompleted || false,
        },
        settings: {
          showNotifications: user?.settings?.showNotifications || true,
          soundEffects: user?.settings?.soundEffects || true,
          dailyReminder: user?.settings?.dailyReminder || false,
        },
      };
      dispatch(setUserAction(appUser));
    } catch (error: any) {
      Logger.error("Error setting user", { error });
      dispatch(setUserAction(null));
    }
  };

  useEffect(() => {
    switch (status) {
      case "authenticated":
        setUser(session.user);
        break;
      case "loading":
        break;
      case "unauthenticated":
        setUser(undefined);
        break;
      default:
        break;
    }
  }, [status]);

  useEffect(() => {
    setUserEventTracker(user);
    setUserLogger(user);
  }, [user]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      if (
        pathname.includes("login") ||
        pathname.includes("register") ||
        pathname === "/" ||
        pathname === "/home"
      ) {
        router.push("/home");
      }
    } else {
      if (!isOnboardingCompleted()) return;
      if (
        !pathname.includes("login") &&
        !pathname.includes("register") &&
        !pathname.includes("privacy")
      ) {
        router.push("/");
      }
    }
  }, [status]);
  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading className="w-20 h-20" />
      </div>
    );
  }
  return children;
}
