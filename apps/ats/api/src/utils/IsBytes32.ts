// SPDX-License-Identifier: Apache-2.0
import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator"
import { isHexString } from "ethers"

export function IsBytes32(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isBytes32",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Must be a valid hex string exactly 32 bytes long
          return typeof value === "string" && isHexString(value, 32)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid bytes32 string (0x + 64 hex chars)`
        },
      },
    })
  }
}
