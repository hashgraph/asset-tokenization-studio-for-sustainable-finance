// SPDX-License-Identifier: Apache-2.0

import { applyDecorators, Injectable } from "@nestjs/common"

export function Singleton() {
  return applyDecorators(Injectable())
}
