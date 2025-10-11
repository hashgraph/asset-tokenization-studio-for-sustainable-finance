// SPDX-License-Identifier: Apache-2.0

import { Inject as NestJSInject } from "@nestjs/common"

export function Inject(name?: string) {
  return (target: any, propertyKey: any, descriptorOrIndex?: any) => {
    let injectionName = name
    if (injectionName === undefined) {
      // Get name from property name
      if (propertyKey !== undefined) {
        // Property name
        injectionName = propertyKey
      } else {
        // Property based constructor
        injectionName = target
          .toString()
          .match(/constructor\((.+)\)/)[1]
          .split(", ")[descriptorOrIndex]
      }
      // Capitalize
      injectionName = injectionName.charAt(0).toUpperCase() + injectionName.slice(1)
    }

    NestJSInject(injectionName)(target, propertyKey, descriptorOrIndex)
  }
}
