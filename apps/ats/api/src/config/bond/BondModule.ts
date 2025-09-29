// SPDX-License-Identifier: Apache-2.0
import { Module } from '@nestjs/common'
import { CreateBondHttpAdapter } from '@port/usecase/bond/createbond/CreateBondHttpAdapter'
import { CreateBondCommandHandler } from '@app/bond/createbond/command/CreateBondCommandHandler'
import { SharedModule } from '@hashgraph/green-bonds-shared-core'

@Module({
  imports: [SharedModule],
  controllers: [CreateBondHttpAdapter],
  providers: [CreateBondCommandHandler],
})
export class BondModule {}
