// ContractExistsForUserError
export class ContractExistsForUserError extends Error {
  constructor() {
    super("Contract already exists for user");
    this.name = "ContractExistsForUserError";
  }
}
