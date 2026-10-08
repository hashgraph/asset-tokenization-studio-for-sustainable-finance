// SPDX-License-Identifier: Apache-2.0

import { applyDecorators, Controller, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common"
import { RestExceptionFilter } from "../errors/RestExceptionFilter"

export function RestController(prefix?: string) {
  return applyDecorators(
    Controller(prefix),
    UsePipes(
      new ValidationPipe({
        transform: true,
        forbidUnknownValues: false,
      }),
    ),
    UseFilters(new RestExceptionFilter()),
  )
}
