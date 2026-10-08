// SPDX-License-Identifier: Apache-2.0
import { ImpactDataUpdatedDLTEvent } from "@port/impactdata/usecase/setbondimpactdata/model/ImpactDataUpdatedDLTEvent"

export interface SetBondImpactDataPort {
  handle(event: ImpactDataUpdatedDLTEvent): Promise<void>
}
