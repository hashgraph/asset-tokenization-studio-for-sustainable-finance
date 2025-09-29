// SPDX-License-Identifier: Apache-2.0

export interface ConfigService {
  getBlockNumber(): number

  getContracts(): string[]

  getEvents(): string[]

  getPollInternal(): number
}
