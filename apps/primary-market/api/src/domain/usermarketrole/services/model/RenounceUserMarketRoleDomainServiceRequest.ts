// SPDX-License-Identifier: Apache-2.0

export class RenounceUserMarketRoleDomainServiceRequest {
  constructor(
    public readonly accountId: string,
    public readonly roleHex: string,
    public readonly marketContractId: string,
  ) {}
}
