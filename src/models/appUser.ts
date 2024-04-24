import Contract from "./contract";
import Obligation from "./obligation";

export default interface AppUser {
  userId: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export type UserData = {
  contracts: Contract[];
  obligations: Obligation[];
};

// Select userId, displayName and photoURL from AppUser
export type AccountabilityPartner = Pick<
  AppUser,
  "userId" | "displayName" | "photoURL"
> & { signedAt?: Date | null };
