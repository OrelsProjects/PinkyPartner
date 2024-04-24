import { Obligation } from "@prisma/client";
import * as ClientObligation from "../../../../models/obligation";

export const formatObligations = (
  obligations: Obligation[],
): ClientObligation.default[] => {
  return obligations.map(obligation => {
    return {
      ...obligation,
      repeat: obligation.repeat as ClientObligation.ObligationRepeat,
      days: obligation.days as ClientObligation.Days,
      timesAWeek: obligation.timesAWeek as ClientObligation.TimesAWeek,
    };
  });
};
