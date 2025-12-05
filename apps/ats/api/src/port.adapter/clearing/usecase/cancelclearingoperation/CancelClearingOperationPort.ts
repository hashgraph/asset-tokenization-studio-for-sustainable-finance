// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationCanceledDLTEvent } from "@port/clearing/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"

export interface CancelClearingOperationPort {
  handle(event: ClearingOperationCanceledDLTEvent): Promise<void>
}
