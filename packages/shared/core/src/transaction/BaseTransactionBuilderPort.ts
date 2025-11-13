import { BuildGrantRoleTransactionRequest } from "@transaction/model/BuildGrantRoleTransactionRequest"
import { BuildTransactionResponse } from "@transaction/model/BuildTransactionResponse"
import { BuildRevokeRoleTransactionRequest } from "@transaction/model/BuildRevokeRoleTransactionRequest"
import { BuildPauseTransactionRequest } from "@transaction/model/BuildPauseTransactionRequest"
import { BuildUnpauseTransactionRequest } from "@transaction/model/BuildUnpauseTransactionRequest"
import { BuildRenounceRoleTransactionRequest } from "@transaction/model/BuildRenounceRoleTransactionRequest"
import { BuildApplyRolesTransactionRequest } from "@transaction/model/BuildApplyRolesTransactionRequest"

export interface BaseTransactionBuilderPort {
  grantRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse>

  revokeRole(request: BuildRevokeRoleTransactionRequest): Promise<BuildTransactionResponse>

  renounceRole(request: BuildRenounceRoleTransactionRequest): Promise<BuildTransactionResponse>

  pause(request: BuildPauseTransactionRequest): Promise<BuildTransactionResponse>

  unpause(request: BuildUnpauseTransactionRequest): Promise<BuildTransactionResponse>

  applyRoles(request: BuildApplyRolesTransactionRequest): Promise<BuildTransactionResponse>
}
