import { Obligation } from "@prisma/client";

export default interface UserContract {
  userContractId: string;
  contractId: string;
  userId: string;
  signed: boolean;
  terminated: boolean;
  terminationReason?: string | null;
}

export type UserContractData = UserContract & {
  obligations: Obligation[];
};
