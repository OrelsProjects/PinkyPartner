import { Contract, Obligation, UserContractObligation } from "@prisma/client";
import {
  CreateUserContractObligation,
  ObligationsToContractObligation,
} from "../../obligation/_utils";
import prisma from "@/app/api/_db/db";

/**
 * Create contract obligations for the week
 * @param obligations obligations to create
 * @param contract contract to create obligations for
 * @returns obligations created for the week
 */
export async function createWeeksContractObligations(
  obligations: Obligation[],
  contract: Contract,
  userIds: string[],
): Promise<UserContractObligation[]> {
  const populatedObligations: Obligation[] = [];

  let allUserContractObligations: CreateUserContractObligation[] = [];
  for (const id of userIds) {
    const {
      populatedObligations: populatedObligationsResult,
      contractObligations,
    } = ObligationsToContractObligation(obligations, contract.contractId, id);

    allUserContractObligations =
      allUserContractObligations.concat(contractObligations);

    if (populatedObligations.length === 0) {
      populatedObligations.push(...populatedObligationsResult);
    }
  }

  const { count } = await prisma.userContractObligation.createMany({
    data: allUserContractObligations,
  });

  let userContractObligations: UserContractObligation[] = [];
  // sort by createdAt and take the last count (the ones we just created)
  userContractObligations = await prisma.userContractObligation.findMany({
    where: {
      userId: {
        in: userIds,
      },
      contractId: contract.contractId,
      obligationId: {
        in: allUserContractObligations.map(ob => ob.obligationId),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: count,
  });

  return userContractObligations;
}
