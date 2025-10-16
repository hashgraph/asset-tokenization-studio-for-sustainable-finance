import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHealthCheck(): { status: string; version: string } {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? 'unknown',
    }
  }
}
