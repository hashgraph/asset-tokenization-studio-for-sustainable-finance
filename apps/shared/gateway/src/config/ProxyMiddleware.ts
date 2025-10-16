// SPDX-License-Identifier: Apache-2.0

import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpStatus,
  InternalServerErrorException,
  NestMiddleware,
} from "@nestjs/common"
import { createProxyMiddleware } from "http-proxy-middleware"
import { Logger, Singleton } from "@hashgraph/green-bonds-shared-core"
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception"
import { AuthService } from "./auth/AuthService"
import { getStatusCode } from "http-proxy-middleware/dist/status-code"
import * as http from "http"

@Singleton()
export class ProxyMiddleware implements NestMiddleware {
  private static readonly PATH_ROUTE_SEPARATOR: string = ","
  private readonly logger = new Logger(ProxyMiddleware.name)
  private readonly routerMap: object
  private readonly authService: AuthService
  private readonly proxy = createProxyMiddleware({
    changeOrigin: true,
    proxyTimeout: +(process.env.TIMEOUT ?? 30000),
    selfHandleResponse: false,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
          const rawBody = (req as any).rawBody
          if (rawBody) {
            proxyReq.setHeader("Content-Length", rawBody.length)
            proxyReq.write(rawBody)
          }
        }
      },
      error: (err, req, res: http.ServerResponse) => {
        const statusCode = "code" in err ? getStatusCode((err as any).code) : +HttpStatus.INTERNAL_SERVER_ERROR
        let httpException
        switch (statusCode) {
          case +HttpStatus.BAD_GATEWAY:
            httpException = new BadGatewayException()
            break
          case +HttpStatus.GATEWAY_TIMEOUT:
            httpException = new GatewayTimeoutException()
            break
          default:
            httpException = new InternalServerErrorException()
            break
        }
        if (!res.headersSent) {
          res.setHeader("Content-Type", "application/json").writeHead(statusCode)
        }
        res.end(JSON.stringify(httpException.response))
      },
    },
    router: (req) => {
      const path = (req as any).baseUrl
      const routePath = Object.keys(this.routerMap).find((routerPath) => path.startsWith(routerPath))
      if (routePath !== undefined && this.routerMap[routePath] !== undefined) {
        return this.routerMap[routePath] + path
      }
      throw new NotFoundException(`Cannot ${req.method} ${path}`)
    },
  })

  constructor(authService: AuthService) {
    this.authService = authService
    this.routerMap = this.buildRouterMap()
    this.logger.log("Router Map:", this.routerMap)
  }

  use(req: any, res: any, next: (error?: any) => void) {
    this.authService.signIn(req.header(process.env.API_KEY_HEADER_NAME))
    this.proxy(req, res, next)
  }

  private buildRouterMap(): object {
    const routerMap = {}
    const paths = (process.env.PATHS ?? "").split(ProxyMiddleware.PATH_ROUTE_SEPARATOR)
    const routes = (process.env.ROUTES ?? "").split(ProxyMiddleware.PATH_ROUTE_SEPARATOR)
    paths.forEach((path, index) => {
      const route = routes[index]
      if (route) {
        routerMap[path] = route
      }
    })
    return routerMap
  }
}
