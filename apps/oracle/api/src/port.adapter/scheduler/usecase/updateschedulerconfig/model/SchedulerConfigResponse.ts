// SPDX-License-Identifier: Apache-2.0
import { SchedulerConfig } from "@domain/scheduler/model/SchedulerConfig"

export class SchedulerConfigResponse {
  id: string
  cronExpression: string
  concurrencyLimit: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date

  static fromDomain(config: SchedulerConfig): SchedulerConfigResponse {
    const response = new SchedulerConfigResponse()
    response.id = config.id
    response.cronExpression = config.cronExpression
    response.concurrencyLimit = config.concurrencyLimit
    response.enabled = config.enabled
    response.createdAt = config.createdAt
    response.updatedAt = config.updatedAt
    return response
  }
}
