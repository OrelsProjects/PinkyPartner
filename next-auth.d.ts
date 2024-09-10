import { DefaultSession } from "next-auth";
import { AppUserMetadata, AppUserSettings } from "@/models/appUser";

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
