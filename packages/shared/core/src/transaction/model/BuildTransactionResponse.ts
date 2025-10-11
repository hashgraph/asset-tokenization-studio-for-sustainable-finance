// SPDX-License-Identifier: Apache-2.0

export class BuildTransactionResponse {
  readonly unsignedTx: string

  constructor(unsignedTx: string) {
    this.unsignedTx = unsignedTx
  }
}
