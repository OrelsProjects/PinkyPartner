import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      meta: {
        referralCode?: string;
        onboardingCompleted?: boolean;
        pushToken?: string;
      };
      settings: {
        showNotifications: boolean;
      };
    } & DefaultSession["user"];
  }
}
