export default interface Obligation {
  obligationId: string;
  userId: string;
  title: string;
  emoji?: string | null;
  description?: string | null;
}

export type CreateObligation = Omit<Obligation, "obligationId" | "userId">;
