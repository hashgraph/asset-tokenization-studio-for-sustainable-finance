// SPDX-License-Identifier: Apache-2.0
import { KpiDataAddedDLTEvent } from "@port/kpidata/usecase/addbondkpidata/model/KpiDataAddedDLTEvent"

export interface AddBondKpiDataPort {
  handle(event: KpiDataAddedDLTEvent): Promise<void>
}
