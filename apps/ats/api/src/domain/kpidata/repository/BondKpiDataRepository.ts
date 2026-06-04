// SPDX-License-Identifier: Apache-2.0
import { BondKpiData } from "@domain/kpidata/model/BondKpiData"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondKpiDataRepository {
  save(kpiData: BondKpiData): Promise<BondKpiData>
  findAllByContractId(bondContractId: string, options: PageOptions): Promise<Page<BondKpiData>>
  findByContractIdAndId(bondContractId: string, id: string): Promise<BondKpiData | null>
}
