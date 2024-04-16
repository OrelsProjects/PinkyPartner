export default interface UserContract {
    userContractId: string;
    contractId: string;
    userId: string;
    signed: boolean;
    terminated: boolean;
    terminationReason?: string | null;
  }