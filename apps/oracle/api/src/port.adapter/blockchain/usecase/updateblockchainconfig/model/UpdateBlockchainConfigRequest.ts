// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString, IsBoolean, IsIn, IsUrl } from "class-validator"

export class UpdateBlockchainConfigRequest {
  @IsOptional()
  @IsString()
  @IsIn(["mainnet", "testnet", "previewnet"], {
    message: "network must be one of: mainnet, testnet, previewnet",
  })
  network?: string

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: "rpcEndpoint must be a valid URL" })
  rpcEndpoint?: string

  @IsOptional()
  @IsBoolean()
  useJsonRpc?: boolean
}
