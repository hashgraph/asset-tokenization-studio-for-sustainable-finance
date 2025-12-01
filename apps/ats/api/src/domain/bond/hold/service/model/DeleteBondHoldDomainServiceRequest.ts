// SPDX-License-Identifier: Apache-2.0
export class DeleteBondHoldDomainServiceRequest {
  constructor(
    public readonly contractId: string,
    public readonly holderAccountId: string,
    public readonly holdId: number,
    public readonly partition: string,
  ) {}
}
