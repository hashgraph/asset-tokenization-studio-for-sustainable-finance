// SPDX-License-Identifier: Apache-2.0

import { UnauthorizedException } from "@nestjs/common"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class AuthService {
  signIn(apiKey: string): void {
    if (!(process.env.API_KEYS ?? "").split(",").includes(apiKey)) {
      throw new UnauthorizedException()
    }
  }
}
