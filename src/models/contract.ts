import AppUser from "./appUser";
import Obligation from "./obligation";

export default interface Contract {
  contractId: string;
  creatorId?: string;
  title: string;
  dueDate: Date;
  description?: string | null;

  obligations: Obligation[];
  signatures: AppUser[];
}

export type CreateContract = Omit<
  Contract,
  "contractId" | "creatorId" | "obligations" | "signatures"
> & {
  signatures: string[];
} & { obligationIds: string[] };
