// SPDX-License-Identifier: Apache-2.0
import { BondKpiDataItemResponse } from "@port/kpidata/usecase/getbondkpidataitem/model/BondKpiDataItemResponse"

export interface GetBondKpiDataItemPort {
  getBondKpiDataItem(bondContractId: string, kpiDataId: string): Promise<BondKpiDataItemResponse>
}
