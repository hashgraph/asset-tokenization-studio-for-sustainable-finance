// SPDX-License-Identifier: Apache-2.0

export class TransactionAppServiceResponse {
  readonly unsignedTx: string

  constructor(unsignedTx: string) {
    this.unsignedTx = unsignedTx
  }
}
