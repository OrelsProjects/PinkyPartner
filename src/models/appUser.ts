import { ContractWithExtras } from "./contract";
import Obligation from "./obligation";

export type UserId = string;
export type DisplayName = string;
export type UserPaidStatus = "premium" | "free" | "suspended";

export enum UserPaidStatusEnum {
  Premium = "premium",
  Free = "free",
  Suspended = "suspended",
}

export default interface AppUser {
  email: string;
  userId: string;
  meta?: AppUserMetadata;
  photoURL?: string | null;
  settings: AppUserSettings;
  displayName?: string | null;
}

export interface Invitations {
  challengeId?: string | null;
}

export interface AppUserMetadata {
  referralCode?: string;
  onboardingCompleted?: boolean;
  pushToken?: string;
  paidStatus?: UserPaidStatus;
}

export interface AppUserSettings {
  showNotifications: boolean;
  soundEffects: boolean;
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
