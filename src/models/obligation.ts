import Contract from "./contract";

export type ObligationRepeat = "Daily" | "Weekly";
export type Day = 1 | 2 | 3 | 4 | 5 | 6 | 0;
export type Days = Day[];
export type TimesAWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default interface Obligation {
  obligationId: string;
  userId: string;
  title: string;
  description: string | null;
  repeat: string;
  days: number[];
  timesAWeek: number | null;
  emoji: string | null;
}

export type CreateObligation = Omit<Obligation, "obligationId" | "userId">;

export type ContractWithUser = {
  contract: Contract;
  appUser?: {
    photoURL: string;
    displayName: string;
    userId: string;
  };
};

export type ContractsWithUser = ContractWithUser[];
