// SPDX-License-Identifier: Apache-2.0

import {
    ClearingOperationCanceledDLTEvent
} from "@port/bond/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent";

export interface CancelClearingHoldOperationPort {
  handle(event: ClearingOperationCanceledDLTEvent): Promise<void>
}
