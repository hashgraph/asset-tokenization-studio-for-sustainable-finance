// SPDX-License-Identifier: Apache-2.0

import { ERC721RemovedDLTEvent } from "./model/ERC721RemovedDLTEvent"

export interface RemoveEnvironmentalAssetPort {
  handle(event: ERC721RemovedDLTEvent): Promise<void>
}
