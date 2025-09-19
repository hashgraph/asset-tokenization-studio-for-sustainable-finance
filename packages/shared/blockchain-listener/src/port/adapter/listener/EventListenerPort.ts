// SPDX-License-Identifier: Apache-2.0
export default interface EventListenerPort {
  subscribe(listener: (event: any) => void): void
  unsubscribe?(): void
}
