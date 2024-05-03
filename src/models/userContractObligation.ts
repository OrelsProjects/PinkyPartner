import Contract from "./contract";
import Obligation from "./obligation";

type UserBasicData = {
  photoURL?: string | null;
  displayName?: string | null;
  userId: string;
};

export default interface UserContractObligation {
  userContractObligationId: string;
  contractId: string;
  obligationId: string;
  dueDate?: Date | null; // Specific due date for this obligation in the context of the contract
  completedAt?: Date | null; // Date when the obligation was completed
  viewedAt?: Date; // Date when the obligation was viewed by the partner

  appUser: UserBasicData;
  obligation: Obligation;
}
