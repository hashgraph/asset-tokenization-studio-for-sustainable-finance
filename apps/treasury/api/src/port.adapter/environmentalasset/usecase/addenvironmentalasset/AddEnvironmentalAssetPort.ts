// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetAddedDLTEvent } from "./model/ERC721AddedDLTEvent"

export interface AddEnvironmentalAssetPort {
  handle(event: EnvironmentalAssetAddedDLTEvent): Promise<void>
}
