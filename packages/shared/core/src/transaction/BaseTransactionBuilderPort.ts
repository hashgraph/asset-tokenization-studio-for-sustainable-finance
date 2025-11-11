import { BuildGrantRoleTransactionRequest } from "@transaction/model/BuildGrantRoleTransactionRequest"
import { BuildTransactionResponse } from "@transaction/model/BuildTransactionResponse"
import { BuildRevokeRoleTransactionRequest } from "@transaction/model/BuildRevokeRoleTransactionRequest"

export interface BaseTransactionBuilderPort {
  grantRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse>

  revokeRole(request: BuildRevokeRoleTransactionRequest): Promise<BuildTransactionResponse>
}
