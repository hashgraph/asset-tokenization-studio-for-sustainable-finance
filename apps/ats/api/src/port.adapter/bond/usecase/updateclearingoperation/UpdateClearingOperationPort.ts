// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationApprovedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"

export interface UpdateClearingOperationPort {
  handle(event: ClearingOperationApprovedDLTEvent | ClearingOperationReclaimedDLTEvent): Promise<void>
}
