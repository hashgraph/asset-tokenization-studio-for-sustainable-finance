import { BaseTransactionAppServiceRequest } from '@hashgraph/green-bonds-shared-core'
import { IsNotEmpty, IsString } from 'class-validator'

export class GrantRoleTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly role: string

  @IsNotEmpty()
  @IsString()
  readonly userAccountId: string

  constructor(format: string, accountId: string, contractId: string, role: string, userAccountId: string) {
    super(format, accountId, contractId)
    this.role = role
    this.userAccountId = userAccountId
  }
}
