import { Contract, Obligation, UserContractObligation } from "@prisma/client";

/**
 * ({ obligationCompletedId: string; userId: string; obligationId: string; completedAt: Date; })[]
 */

export type CreateUserContractObligation = Omit<
  UserContractObligation,
  "userContractObligationId" | "completedAt" | "viewedAt" | "createdAt"
>;

export type ObligationsInContract = {
  contract: Contract;
  obligations: Obligation[];
  appUser?: {
    photoURL?: string | null;
    displayName?: string | null;
  };
};

// /**
//  * @returns Date object representing the start of the week (Sunday) at 00:00:00.000
//  */
export function getStartOfTheWeekDate(sunday: boolean = true): Date {
  const now = new Date();
  const nowDay = now.getDay();

  now.setHours(0, 0, 0, 0);
  if (sunday && nowDay === 0) {
    return now;
  } else {
    const date = new Date(
      now.setDate(now.getDate() - nowDay + (sunday ? 0 : 1)),
    );
    return date;
  }
  // let diff = now.getDate() - day + (day === 0 ? -7 : 0);
  // if (!sunday) {
  //   diff += 1;
  // }
  // Set hours to 0, minutes to 0, seconds to 0, milliseconds to 0
  // const date = new Date(now.setDate(diff));
  // return date;
}

// /**
//  * @returns Date object representing the end of the week (Saturday) at 23:59:59.999
//  */
export function getEndOfTheWeekDate(): Date {
  const startOfTheWeek = getStartOfTheWeekDate();
  // Set hours to 23, minutes to 59, seconds to 59, milliseconds to 999
  const endOfTheWeek = new Date(startOfTheWeek);
  endOfTheWeek.setDate(startOfTheWeek.getDate() + 6);
  endOfTheWeek.setHours(23, 59, 59, 999);
  return endOfTheWeek;
}

// /**
//  * Determines if the obligation has been completed for the given day.
//  * @param obligation Obligation to check.
//  * @param completedObligations List of completed obligations.
//  * @param day Day to check.
//  * @returns true if the obligation has been completed on the given day.
//  */
function isCompletedOnDay(
  obligation: Obligation,
  completedObligations: UserContractObligation[],
  day: number,
): boolean {
  return completedObligations.some(
    co =>
      co.obligationId === obligation.obligationId &&
      co.completedAt &&
      new Date(co.completedAt).getDay() >= day,
  );
}

// /**
//  * Calculates and returns obligations that need to be completed for the current week based on the given obligations and their completion status.
//  * @param weeksCompletedObligations Obligations that have been completed in the current week.
//  * @param weeksObligationsInContract A single contract's obligations for the week.
//  * @returns An array of Obligation objects that are due to be completed in the current week.
//  */
export function populateObligationsToComplete(
  weeksObligationsInContract: ObligationsInContract,
  weeksCompletedObligations: UserContractObligation[],
): Obligation[] {
  const today = new Date().getDay();
  const { obligations } = weeksObligationsInContract;

  let obligationsToAdd: Obligation[] = [];
  for (const obligation of obligations) {
    if (obligation.repeat.toLowerCase() === "daily") {
      for (const day of obligation.days) {
        if (!isCompletedOnDay(obligation, weeksCompletedObligations, day)) {
          obligationsToAdd.push({
            ...obligation,
            days: [day],
          });
        }
      }
    } else {
      const completedCount = weeksCompletedObligations.filter(
        co => co.obligationId === obligation.obligationId,
      ).length;
      const remainingCount = (obligation.timesAWeek ?? 0) - completedCount;
      for (let i = 0; i < remainingCount; i++) {
        obligationsToAdd.push(obligation);
      }
    }
  }
  return obligationsToAdd;
}

export function ObligationsToContractObligation(
  obligations: Obligation[],
  contractId: string,
  userId: string,
): {
  contractObligations: CreateUserContractObligation[];
  populatedObligations: Obligation[];
} {
  const contractObligations: CreateUserContractObligation[] = [];
  const populatedObligations: Obligation[] = [];
  obligations.map(obligation => {
    if (obligation.repeat.toLowerCase() === "daily") {
      obligation.days.forEach(day => {
        const dueDate = new Date();
        dueDate.setHours(23, 59, 59, 999);
        dueDate.setDate(dueDate.getDate() + (day - dueDate.getDay()));
        populatedObligations.push({
          ...obligation,
          userId: userId,
          days: [day],
        });
        contractObligations.push({
          userId: userId,
          obligationId: obligation.obligationId,
          contractId: contractId,
          dueDate: dueDate,
        });
      });
    } else {
      Array.from({ length: obligation.timesAWeek || 0 }).forEach((_, i) => {
        populatedObligations.push({ ...obligation, userId });
        const endOfTheWeek = getEndOfTheWeekDate();
        contractObligations.push({
          userId: userId,
          obligationId: obligation.obligationId,
          contractId: contractId,
          dueDate: endOfTheWeek,
        });
      });
    }
  });

  return { contractObligations, populatedObligations };
}
