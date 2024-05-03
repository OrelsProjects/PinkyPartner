import { AccountabilityPartner } from "./appUser";
import Obligation from "./obligation";

export default interface Contract {
  contractId: string;
  creatorId?: string | null;
  title: string;
  dueDate: Date;
  description?: string | null;
  createdAt: Date;
  viewedAt?: Date | string | null;

  contractees: AccountabilityPartner[];
  obligations: Obligation[];
  signatures: AccountabilityPartner[];
}

export type CreateContract = Omit<
  Contract,
  "contractId" | "creatorId" | "obligations" | "signatures" | "createdAt"
> & {
  signatures: string[];
} & { obligationIds: string[] };
