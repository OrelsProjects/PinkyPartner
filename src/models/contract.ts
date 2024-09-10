import { AccountabilityPartner } from "./appUser";
import Obligation from "./obligation";

export type ContractType = "contract" | "challenge";

export default interface Contract {
  contractId: string;
  creatorId?: string;
  title: string;
  dueDate: Date;
  description?: string | null;
  createdAt: Date;
  viewedAt?: string;
  type?: ContractType | null;
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
} & { obligations?: Omit<Obligation, "obligationId">[] };

export type CreateContractForm = Omit<
  ContractWithExtras,
  "contractId" | "creatorId" | "obligations" | "signatures" | "createdAt"
> & {
  signatures: AccountabilityPartner[];
} & { obligations?: Obligation[] };

export type UpdateContract = Pick<Contract, "title" | "description">;
