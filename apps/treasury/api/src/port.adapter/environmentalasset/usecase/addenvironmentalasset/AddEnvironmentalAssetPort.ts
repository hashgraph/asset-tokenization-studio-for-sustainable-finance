// SPDX-License-Identifier: Apache-2.0

import { ERC721AddedDLTEvent } from "./model/ERC721AddedDLTEvent"

export interface AddEnvironmentalAssetPort {
  handle(event: ERC721AddedDLTEvent): Promise<void>
}
