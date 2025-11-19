// SPDX-License-Identifier: Apache-2.0
import { Get } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"

@RestController("health")
export class HealthHttpAdapter {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "oracle-api",
    }
  }
}
