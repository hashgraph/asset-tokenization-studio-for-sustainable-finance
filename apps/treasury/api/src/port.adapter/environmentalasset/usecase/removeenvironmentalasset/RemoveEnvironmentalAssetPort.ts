// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetRemovedDLTEvent } from "./model/ERC721RemovedDLTEvent"

export interface RemoveEnvironmentalAssetPort {
  handle(event: EnvironmentalAssetRemovedDLTEvent): Promise<void>
}
