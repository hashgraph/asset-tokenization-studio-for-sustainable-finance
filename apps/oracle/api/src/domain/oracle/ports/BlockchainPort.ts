// SPDX-License-Identifier: Apache-2.0

export interface WriteKpiResult {
  transactionHash: string
  success: boolean
}

export interface BlockchainPort {
  /**
   * Write KPI value to the smart contract
   */
  writeKpiToContract(kpiContractId: string, projectId: string, kpiValue: number, date: Date): Promise<WriteKpiResult>
}
