// UserNotPremiumError.ts
export class UserNotPremiumError extends Error {
  constructor() {
    super("User is not premium");
    this.name = "UserNotPremiumError";
  }
}
