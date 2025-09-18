// SPDX-License-Identifier: Apache-2.0

import { NestMiddleware } from "@nestjs/common"
import { createProxyMiddleware } from "http-proxy-middleware"
import { Logger, Singleton } from "@hashgraph/green-bonds-shared-core"
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception"

@Singleton()
export class ProxyMiddleware implements NestMiddleware {
  private static readonly PATH_ROUTE_SEPARATOR: string = ","
  private readonly logger = new Logger(ProxyMiddleware.name)
  private readonly routerMap: object
  private readonly proxy = createProxyMiddleware({
    changeOrigin: true,
    router: (req) => {
      const path = req["baseUrl"]
      const routePath = Object.keys(this.routerMap).find((routerPath) => path.startsWith(routerPath))
      if (routePath !== undefined && this.routerMap[routePath] !== undefined) {
        return this.routerMap[routePath] + path
      }
      throw new NotFoundException(`Cannot ${req.method} ${path}`)
    },
  })

  constructor() {
    this.routerMap = this.buildRouterMap()
    this.logger.log("Router Map:", this.routerMap)
  }

  use(req: any, res: any, next: (error?: any) => void) {
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
