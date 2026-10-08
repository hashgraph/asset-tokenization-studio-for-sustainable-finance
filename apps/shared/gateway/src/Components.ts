// SPDX-License-Identifier: Apache-2.0

import { AuthService } from "./config/auth/AuthService"
import { ApiDocService } from "./config/apidoc/ApiDocService"
import { HealthHttpAdapter } from "./config/health/HealthHttpAdapter"

export const PROVIDERS = [AuthService, ApiDocService]

export const CONTROLLERS = [HealthHttpAdapter]
