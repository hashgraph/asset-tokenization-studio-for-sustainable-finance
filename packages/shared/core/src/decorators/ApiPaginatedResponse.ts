// SPDX-License-Identifier: Apache-2.0

import { applyDecorators } from "@nestjs/common"
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger"
import { PageResponse } from "@pagination/PageResponse"

export function ApiPaginatedResponse(model: any) {
  return applyDecorators(
    ApiExtraModels(PageResponse, model),
    ApiResponse({
      status: 200,
      description: "OK",
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageResponse) },
          {
            properties: {
              items: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  )
}
