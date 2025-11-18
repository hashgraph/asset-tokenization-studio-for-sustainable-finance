// SPDX-License-Identifier: Apache-2.0

export class OracleRegistryQueryResponse {
  id: string
  bondContractId: string
  kpiContractId: string
  projects: Array<{
    projectId: string
    topicId: string
  }>
  config: {
    schedulerStartDate: Date
    schedulerEndDate: Date | null
    frequencyMinutes: number
  }
  status: string
  createdAt: Date
  updatedAt: Date
}
