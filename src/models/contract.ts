import AppUser, { AccountabilityPartner } from "./appUser";
import Obligation, { CreateObligation } from "./obligation";

export default interface Contract {
  contractId: string;
  creatorId?: string;
  title: string;
  dueDate: Date;
  description?: string | null;
  createdAt: Date;
  viewedAt?: string;
}

export type ContractWithExtras = Contract & {
  contractees: AccountabilityPartner[];
  obligations: Obligation[];
  signatures: AccountabilityPartner[];
};

export type CreateContract = Omit<
  ContractWithExtras,
  "contractId" | "creatorId" | "obligations" | "signatures" | "createdAt"
> & {
  signatures: AccountabilityPartner[];
} & { obligation?: CreateObligation };

export type UpdateContract = Pick<Contract, "title" | "description">;
