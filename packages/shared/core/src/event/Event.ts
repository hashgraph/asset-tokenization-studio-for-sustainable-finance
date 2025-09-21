// SPDX-License-Identifier: Apache-2.0

export abstract class Event {
  readonly timestamp: number = Date.now()
}
