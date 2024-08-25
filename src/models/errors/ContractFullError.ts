// ContractFullError
export class ContractFullError extends Error {
  constructor() {
    super('Contract is full');
    this.name = 'ContractFullError';
  }
}
