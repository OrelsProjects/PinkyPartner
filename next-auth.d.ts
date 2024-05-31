import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface SessionUser {
    userId: string;
    meta: {
      referralCode?: string;
      onboardingCompleted?: boolean;
      pushToken?: string;
    };
    settings: {
      showNotifications: boolean;
      soundEffects: boolean;
    };
  }

  interface Session {
    user: SessionUser & DefaultSession["user"];
  }
}
