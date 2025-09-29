// SPDX-License-Identifier: Apache-2.0

import { EventSignatureRequest } from "@port/blockchain/model/EventSignatureRequest"

export default interface DecodeLogRequest {
  readonly timestamp: string
  readonly transactionHash: string
  readonly data: string
  readonly topics: string[]
  readonly eventSignatures: EventSignatureRequest[]
}
