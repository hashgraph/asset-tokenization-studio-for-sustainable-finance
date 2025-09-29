// SPDX-License-Identifier: Apache-2.0
import { Module } from '@nestjs/common'
import { AppController } from './AppController'
import { AppService } from './AppService'
import { BondModule } from './config/bond/BondModule'

@Module({
  imports: [BondModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
