import { UserPaidStatus, UserPaidStatusEnum } from "@/models/appUser";
import Contract, { ContractType, ContractWithExtras } from "@/models/contract";

const MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM = 999;
const MAX_PARTICIPANTS_IN_CONTRACT_FREE = 1;

export function canAddUsersToContract(
  contractType: ContractType,
  contracteesCount: number,
  paidStatus?: UserPaidStatus,
) {
  if (!contracteesCount) {
    return false;
  }

  if (
    paidStatus === UserPaidStatusEnum.Premium ||
    contractType === "challenge"
  ) {
    return contracteesCount < MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM;
  }
  return contracteesCount < MAX_PARTICIPANTS_IN_CONTRACT_FREE;
}

export function getMaxParticipantsInContract(paidStatus?: UserPaidStatus) {
  if (paidStatus === UserPaidStatusEnum.Premium) {
    return MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM;
  }
  return MAX_PARTICIPANTS_IN_CONTRACT_FREE;
}
