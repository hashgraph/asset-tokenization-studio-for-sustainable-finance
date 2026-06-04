// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddBondKpiDataDomainServiceRequest } from "./model/AddBondKpiDataDomainServiceRequest"
import { BondKpiData } from "@domain/kpidata/model/BondKpiData"
import type { BondKpiDataRepository } from "@domain/kpidata/repository/BondKpiDataRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class AddBondKpiDataDomainService {
  constructor(
    @Inject() private readonly bondKpiDataRepository: BondKpiDataRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: AddBondKpiDataDomainServiceRequest): Promise<BondKpiData> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)

    const kpiData = Object.assign(new BondKpiData(), {
      bondContractId: request.bondContractId,
      project: request.project,
      date: request.date,
      value: request.value,
    })

    return await this.bondKpiDataRepository.save(kpiData)
  }
}
