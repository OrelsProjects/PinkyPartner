import { UserPaidStatus } from "../../models/appUser";
import { ContractWithExtras } from "../../models/contract";

const MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM = 999;
const MAX_PARTICIPANTS_IN_CONTRACT_FREE = 1;

export function canAddUsersToContract(
  value?: number | ContractWithExtras,
  paidStatus?: UserPaidStatus,
) {
  if (!value) {
    return false;
  }
  const contracteesCount =
    typeof value === "number" ? value : value.contractees.length;

  if (paidStatus === "premium") {
    return contracteesCount < MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM;
  }
  return contracteesCount < MAX_PARTICIPANTS_IN_CONTRACT_FREE;
}

export function getMaxParticipantsInContract(paidStatus?: UserPaidStatus) {
  if (paidStatus === "premium") {
    return MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM;
  }
  return MAX_PARTICIPANTS_IN_CONTRACT_FREE;
}
