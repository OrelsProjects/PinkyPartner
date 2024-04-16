export default interface Obligation {
  obligationId: string;
  title: string;
  description?: string | null;
  userId: string;
}

export type CreateObligation = Omit<Obligation, "obligationId">;
