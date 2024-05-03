import { Contract, Obligation, UserContractObligation } from "@prisma/client";
import {
  CreateUserContractObligation,
  ObligationsToContractObligation,
  populateObligationsToComplete,
} from "../../obligation/_utils";
import prisma from "../../_db/db";

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
): Promise<{
  obligations: Obligation[];
  userContractObligations: UserContractObligation[];
}> {
  const populatedObligations = populateObligationsToComplete(
    {
      obligations,
      contract,
    },
    [],
  );

  let allUserContractObligations: CreateUserContractObligation[] = [];
  for (const id of userIds) {
    allUserContractObligations = allUserContractObligations.concat(
      ObligationsToContractObligation(
        populatedObligations,
        contract.contractId,
        id,
      ),
    );
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
        in: populatedObligations.map(ob => ob.obligationId),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: count,
  });

  return {
    obligations: populatedObligations,
    userContractObligations: userContractObligations,
  };
}
