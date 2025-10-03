import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class TreasuryNotFoundError extends EntityNotFoundError {
  constructor(addresses: string[]) {
    super(`Treasury not found for any of the addresses: ${addresses.join(", ")}.`)
  }
}
