import { NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"
import { Logger } from "@hashgraph/green-bonds-shared-core"

export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP")

  use(req: Request, res: Response, next: NextFunction): void {
    const startAt = process.hrtime()
    const { method, originalUrl } = req
    const resLimit = +(process.env.LOG_RESPONSE_BODY_LIMIT ?? 500)

    const resChunks: Buffer[] = []
    const origWrite = (res.write as any).bind(res)
    const origEnd = (res.end as any).bind(res)
    ;(res.write as any) = function (chunk: any, encoding?: any, cb?: any) {
      if (chunk) {
        resChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
      }
      return origWrite(chunk, encoding, cb)
    }
    ;(res.end as any) = function (chunk?: any, encoding?: any, cb?: any) {
      if (chunk) {
        resChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
      }
      try {
        const ct = (res.getHeader("content-type") as string) || ""
        const isText = ct.includes("application/json") || ct.startsWith("text/")
        let bodyStr = Buffer.concat(resChunks).toString("utf8")
        if (!isText && bodyStr) {
          bodyStr = `(non-text ${Buffer.byteLength(bodyStr)} bytes)`
        }
        if (bodyStr && bodyStr.length > resLimit) {
          bodyStr = bodyStr.substring(0, resLimit)
        }
        if (bodyStr) {
          ;(req as any)._resBodyLogged = bodyStr
        }
      } catch {}
      return origEnd(chunk, encoding, cb)
    }

    res.on("finish", () => {
      const { statusCode } = res
      const contentLength = res.getHeader("content-length") as string | number | undefined
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      const bodyStr = (req as any)._resBodyLogged
      this.logger.log(
        `RES ${method} ${originalUrl} ${statusCode} ${responseTime.toFixed(2)}ms ${contentLength ?? "-"} BODY: ${bodyStr ?? ""}`,
      )
    })

    next()
  }
}
