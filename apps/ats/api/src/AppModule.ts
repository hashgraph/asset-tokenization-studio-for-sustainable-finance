// SPDX-License-Identifier: Apache-2.0
import { Module } from '@nestjs/common'
import { CONTROLLERS, PROVIDERS } from './Components'

@Module({
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class AppModule {}
