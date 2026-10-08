// SPDX-License-Identifier: Apache-2.0

import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"

export interface SyncEnvironmentalAssetTokenPort {
  handle(event: TransferDLTEvent): Promise<void>
}
