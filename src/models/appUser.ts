import { ContractWithExtras } from "./contract";
import Obligation from "./obligation";

export type UserId = string;
export type DisplayName = string;

export default interface AppUser {
  email: string;
  userId: string;
  meta?: AppUserMetadata;
  photoURL?: string | null;
  settings: AppUserSettings;
  displayName?: string | null;
}

export interface AppUserMetadata {
  referralCode: string;
  onboardingCompleted: boolean;
  pushToken?: string;
  pushTokenMobile?: string;
}

export interface AppUserSettings {
  showNotifications: boolean;
  soundEffects: boolean;
  dailyReminder: boolean;
}

export type UserData = {
  contracts: ContractWithExtras[];
  obligations: Obligation[];
  obligationsToComplete: Obligation[];
};

// Select userId, displayName and photoURL from AppUser
export type AccountabilityPartner = Pick<
  AppUser,
  "userId" | "displayName" | "photoURL"
> & { signedAt?: Date | null };
