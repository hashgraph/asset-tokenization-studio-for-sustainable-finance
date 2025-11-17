// SPDX-License-Identifier: Apache-2.0

export interface HealthPort {
  check(): Promise<any>
}
