import Contract from "./contract";
import Obligation from "./obligation";
import { UserBasicData } from "./userContractObligation";

export default interface AppUser {
  userId: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  meta?: AppUserMetadata;
}

export interface AppUserMetadata {
  referralCode: string;
}

export type UserData = {
  contracts: Contract[];
  obligations: Obligation[];
  obligationsToComplete: Obligation[];
};

// Select userId, displayName and photoURL from AppUser
export type AccountabilityPartner = UserBasicData & { signedAt?: Date | null };
