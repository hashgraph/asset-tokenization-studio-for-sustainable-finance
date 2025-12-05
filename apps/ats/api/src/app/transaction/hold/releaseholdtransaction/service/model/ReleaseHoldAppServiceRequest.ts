// SPDX-License-Identifier: Apache-2.0
export class ReleaseHoldAppServiceRequest {
  constructor(
    public readonly format: string,
    public readonly accountId: string,
    public readonly contractId: string,
    public readonly holderAccountId: string,
    public readonly partition: string,
    public readonly holdId: number,
    public readonly amount: string,
  ) {}
}
