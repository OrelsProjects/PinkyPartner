import { UserPaidStatus } from "../../models/appUser";
import { ContractWithExtras } from "../../models/contract";
import {
  MAX_PARTICIPANTS_IN_CONTRACT_FREE,
  MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM,
} from "../utils";

export function canAddUsersToContract(
  contract: ContractWithExtras,
  paidStatus?: UserPaidStatus,
): boolean {
  if (paidStatus === "premium") {
    return contract.contractees.length < MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM;
  }
  return contract.contractees.length < MAX_PARTICIPANTS_IN_CONTRACT_FREE;
}
