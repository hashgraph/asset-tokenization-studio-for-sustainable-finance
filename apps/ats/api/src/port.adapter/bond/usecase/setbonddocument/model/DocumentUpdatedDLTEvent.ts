// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class DocumentUpdatedDLTEvent extends DLTEvent {
  readonly _name: string
  readonly _uri: string
  readonly _documentHash: string

  constructor(contractId: string, transactionHash: string, _name: string, _uri: string, _documentHash: string) {
    super(contractId, transactionHash)
    this._name = _name
    this._uri = _uri
    this._documentHash = _documentHash
  }
}
