import { ContractWithExtras } from "@/models/contract";
import { UserContractObligationData } from "@/models/userContractObligation";

export type ContractId = string;
export type ObligationId = string;
export type PartnerId = string;
export type UserId = string;

export type GroupObligationsUserData = {
  [key: ObligationId]: UserContractObligationData[];
};

export type GroupObligationsPartnerData = {
  [key: ObligationId]: {
    partnerId: PartnerId;
    isSigned: boolean;
    data: UserContractObligationData[];
  }[];
};

export type GroupedObligationsData = {
  userObligations: { [key: ObligationId]: UserContractObligationData[] };
  partnersObligations: {
    [key: ObligationId]: {
      partnerId: PartnerId;
      isSigned: boolean;
      data: UserContractObligationData[];
    }[];
  };
  newObligations: UserContractObligationData[];
  contract: ContractWithExtras;
  isSigned: boolean;
  isAnyPartnerSigned: boolean;
};

export type GroupedObligations = {
  [key: ContractId]: GroupedObligationsData;
};

export function buildGroupedObligationsForContract(
  contract: ContractWithExtras,
  signatures: UserId[],
  userData: UserContractObligationData[],
  partnerData: {
    partnerId: string;
    contractObligations: UserContractObligationData[];
  }[],
): GroupedObligationsData {
  if (userData.length === 0) {
    return {
      userObligations: {},
      partnersObligations: {},
      newObligations: [],
      contract,
      isSigned: false,
      isAnyPartnerSigned: false,
    };
  }
  const userObligations: GroupObligationsUserData = {};
  const partnersObligations: GroupObligationsPartnerData = {};
  const newObligations: UserContractObligationData[] = [];

  const userId = userData[0].userId;

  const isSigned = signatures.includes(userId);
  const isAnyPartnerSigned = signatures.some(signature =>
    partnerData.some(
      partner => partner.partnerId === signature && signature !== userId,
    ),
  );

  userData
    .filter(obligation => obligation.contractId === contract.contractId)
    .forEach(obligation => {
      if (!userObligations[obligation.obligationId]) {
        userObligations[obligation.obligationId] = [];
      }
      userObligations[obligation.obligationId].push(obligation);
    });

  partnerData.forEach(partner => {
    partner.contractObligations
      .filter(obligation => obligation.contractId === contract.contractId)
      .forEach(obligation => {
        if (!partnersObligations[obligation.obligationId]) {
          partnersObligations[obligation.obligationId] = [];
        }
        // if there's an object in the array with the same partnerId, add the obligation to that object's data array
        const partnerData = partnersObligations[obligation.obligationId].find(
          partnerData => partnerData.partnerId === partner.partnerId,
        );
        if (partnerData) {
          partnerData.data.push(obligation);
        } else {
          partnersObligations[obligation.obligationId].push({
            partnerId: partner.partnerId,
            isSigned: signatures.includes(partner.partnerId),
            data: [obligation],
          });
        }
      });
  });

  return {
    userObligations,
    partnersObligations,
    newObligations,
    contract,
    isSigned,
    isAnyPartnerSigned,
  };
}
