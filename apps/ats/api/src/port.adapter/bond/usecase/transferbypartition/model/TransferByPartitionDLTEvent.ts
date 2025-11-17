// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class TransferByPartitionDLTEvent extends DLTEvent {
  readonly _fromPartition: string
  readonly _operator: string
  readonly _from: string
  readonly _to: string
  readonly _value: string
  readonly _data: string
  readonly _operatorData: string

  constructor(
    contractId: string,
    transactionHash: string,
    _fromPartition: string,
    _operator: string,
    _from: string,
    _to: string,
    _value: string,
    _data: string,
    _operatorData: string,
  ) {
    super(contractId, transactionHash)
    this._fromPartition = _fromPartition
    this._operator = _operator
    this._from = _from
    this._to = _to
    this._value = _value
    this._data = _data
    this._operatorData = _operatorData
  }
}
