export default interface ContractObligation {
  contractObligationId: string;
  contractId: string;
  obligationId: string;
  dueDate: Date; // Specific due date for this obligation in the context of the contract
  interval?: number | null; // Optional interval in days between each repetition
  repeat?: number | null; // Optional number of times to repeat at the interval
}
