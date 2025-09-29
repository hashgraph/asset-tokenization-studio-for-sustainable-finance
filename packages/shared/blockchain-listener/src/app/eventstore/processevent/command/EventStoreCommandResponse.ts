// SPDX-License-Identifier: Apache-2.0

export class EventStoreCommandResponse {
  readonly id: string
  readonly status: string
  readonly eventName: string
  readonly data: string
  readonly errorReason: string
}
