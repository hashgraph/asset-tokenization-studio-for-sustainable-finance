// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"

export class UnsupportedClearingOperationTypeError extends DomainError {
  constructor(operationType: ClearingOperationType, supportedTypes: ClearingOperationType[]) {
    const supportedTypesStr = supportedTypes.map((t) => ClearingOperationType[t]).join(", ")
    super(
      `Clearing operation type ${ClearingOperationType[operationType]} (${operationType}) is not currently supported. ` +
        `Currently supported types: ${supportedTypesStr}. ` +
        `Support for other types will be added in future releases.`,
    )
  }

  static forType(operationType: ClearingOperationType): UnsupportedClearingOperationTypeError {
    return new UnsupportedClearingOperationTypeError(operationType, [ClearingOperationType.HOLD])
  }
}
