export default interface Contract {
  contractId: string;
  title: string;
  dueDate: Date;
  description?: string | null;
}

export type CreateContract = Omit<Contract, "contractId">;
