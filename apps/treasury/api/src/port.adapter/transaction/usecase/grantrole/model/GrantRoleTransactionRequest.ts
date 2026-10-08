import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class GrantRoleTransactionRequest extends BaseTransactionRequest {
  constructor(format: string, accountId: string) {
    super(format, accountId)
  }
}
