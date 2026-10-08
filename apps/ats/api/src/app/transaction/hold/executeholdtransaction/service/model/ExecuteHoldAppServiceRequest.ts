// SPDX-License-Identifier: Apache-2.0
export class ExecuteHoldAppServiceRequest {
  constructor(
    public readonly format: string,
    public readonly accountId: string,
    public readonly bondContractId: string,
    public readonly holderAccountId: string,
    public readonly partition: string,
    public readonly holdId: number,
    public readonly toAccountId: string,
    public readonly amount: string,
  ) {}
}
