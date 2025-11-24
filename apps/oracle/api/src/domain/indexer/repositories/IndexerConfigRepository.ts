// SPDX-License-Identifier: Apache-2.0
import { IndexerConfig } from "../model/IndexerConfig"

export interface IndexerConfigRepository {
  save(config: IndexerConfig): Promise<IndexerConfig>
  findConfig(): Promise<IndexerConfig | null>
  getOrCreateDefault(): Promise<IndexerConfig>
}
