// SPDX-License-Identifier: Apache-2.0
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"

export class GetClearingResponse {
  clearing: ClearingHold

  constructor(clearing: ClearingHold) {
    this.clearing = clearing
  }
}
