// SPDX-License-Identifier: Apache-2.0
import { BondKpiDataResponse } from "@port/kpidata/usecase/getbondkpidata/model/BondKpiDataResponse"
import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"

export interface GetBondKpiDataPort {
  getBondKpiData(
    bondContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondKpiDataResponse>>
}
