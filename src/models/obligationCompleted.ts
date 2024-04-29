/**
 * obligationCompletedId: string
      userId: string
      obligationId: string
      completedAt: Date
      
 */

import Contract from "./contract";
import Obligation from "./obligation";

export default interface ObligationCompleted {
  obligationCompletedId: string;
  obligationId: string;
  completedAt: Date;
  contractId: string;
  obligation: Obligation;
  contract: Contract;
  appUser?: {
    photoURL: string;
    displayName: string;
    userId: string;
  };
}
