import Obligation from "./obligation";
import UserContract, { UserContractData } from "./userContract";

export default interface AppUser {
  userId: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export type UserData = {
  contracts: UserContractData[];
  obligations: Obligation[];
};

// Select userId, displayName and photoURL from AppUser
export type AccountabilityPartner = Pick<
  AppUser,
  "userId" | "displayName" | "photoURL"
>;
