// SPDX-License-Identifier: Apache-2.0

export class EventSignatureRequest {
  readonly contractAddress: string
  readonly eventSignature: string
  readonly normalizedEventSignatureHash: string
}
