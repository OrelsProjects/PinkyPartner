import { DefaultSession } from "next-auth";
import { AppUserMetadata, AppUserSettings } from "./src/models/appUser";

declare module "next-auth" {
  interface SessionUser {
    userId: string;
    meta: Partial<AppUserMetadata>;
    settings: Partial<AppUserSettings>;
  }

  interface Session {
    user: SessionUser & DefaultSession["user"];
  }
}
