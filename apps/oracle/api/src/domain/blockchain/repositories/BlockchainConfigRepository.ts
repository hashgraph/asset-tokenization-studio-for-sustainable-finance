// SPDX-License-Identifier: Apache-2.0
import { BlockchainConfig } from "../model/BlockchainConfig"

export interface BlockchainConfigRepository {
  save(config: BlockchainConfig): Promise<BlockchainConfig>
  findConfig(): Promise<BlockchainConfig | null>
  getOrCreateDefault(): Promise<BlockchainConfig>
}
