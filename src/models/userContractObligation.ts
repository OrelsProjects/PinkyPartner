import Contract from "./contract";
import Obligation from "./obligation";

export type UserBasicData = {
  photoURL?: string | null;
  displayName?: string | null;
  userId: string;
};

export default interface UserContractObligation {
  userContractObligationId: string;
  userId: string;
  obligationId: string;
  contractId: string;
  dueDate?: Date | null; // Specific due date for this obligation in the context of the contract
  completedAt?: Date | null; // Date when the obligation was completed
  viewedAt?: Date | null; // Date when the obligation was viewed by the partner
}

export type UserContractObligationData = UserContractObligation & {
  appUser: UserBasicData;
  obligation: Obligation;
  contract: Contract;
};

export type GetNextUpObligationsResponse = {
  userContractObligations: UserContractObligationData[];
  partnersContractObligations: {
    partnerId: string;
    contractObligations: UserContractObligationData[];
  }[];
};
