// SPDX-License-Identifier: Apache-2.0
export class CreateBondCommandResponse {
  unsignedTx: string

  constructor(unsignedTx: string) {
    this.unsignedTx = unsignedTx
  }
}
