import { DefaultSession } from "next-auth";
import { UserPaidStatus } from "./src/lib/features/auth/authSlice";
import { AppUserMetadata, AppUserSettings } from "./src/models/appUser";

declare module "next-auth" {
  interface SessionUser {
    userId: string;
    meta: AppUserMetadata;
    settings: AppUserSettings;
    invitations?: {
      challengeId?: string | null;
    };
  }

  interface Session {
    user: SessionUser & DefaultSession["user"];
  }
}
