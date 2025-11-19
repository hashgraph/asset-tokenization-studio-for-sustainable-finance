// SPDX-License-Identifier: Apache-2.0
import { SchedulerConfig } from "../model/SchedulerConfig"

export interface SchedulerConfigRepository {
  save(config: SchedulerConfig): Promise<SchedulerConfig>
  findConfig(): Promise<SchedulerConfig | null>
  getOrCreateDefault(): Promise<SchedulerConfig>
}
