// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import EventListenerPort from "./EventListenerPort"
import { ProcessBlocksAppService } from "@app/block/processblock/service/ProcessBlocksAppService"
import { OnApplicationBootstrap } from "@nestjs/common"

@Singleton()
export class EventListenerNestJSOnApplicationBootstrap implements EventListenerPort, OnApplicationBootstrap {
  constructor(private readonly processBlocksAppService: ProcessBlocksAppService) {}

  onApplicationBootstrap(): any {
    this.start()
  }

  start(): void {
    this.processBlocksAppService.execute()
  }
}
