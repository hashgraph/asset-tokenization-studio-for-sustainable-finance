// SPDX-License-Identifier: Apache-2.0
import { Get, Patch, Body } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import { SchedulerService } from "../SchedulerService"
import { UpdateSchedulerConfigRequest } from "./updateschedulerconfig/model/UpdateSchedulerConfigRequest"
import { SchedulerConfigResponse } from "./updateschedulerconfig/model/SchedulerConfigResponse"

@RestController("scheduler/config")
export class SchedulerConfigHttpAdapter {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get()
  async getConfig(): Promise<SchedulerConfigResponse> {
    const config = await this.schedulerService.getConfig()
    return SchedulerConfigResponse.fromDomain(config)
  }

  @Patch()
  async updateConfig(@Body() request: UpdateSchedulerConfigRequest): Promise<SchedulerConfigResponse> {
    let config = await this.schedulerService.getConfig()

    if (request.cronExpression !== undefined) {
      config = await this.schedulerService.updateCronExpression(request.cronExpression)
    }

    if (request.concurrencyLimit !== undefined) {
      config = await this.schedulerService.updateConcurrencyLimit(request.concurrencyLimit)
    }

    if (request.enabled !== undefined) {
      config = await this.schedulerService.setEnabled(request.enabled)
    }

    return SchedulerConfigResponse.fromDomain(config)
  }
}
