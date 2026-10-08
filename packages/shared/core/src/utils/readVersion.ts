// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "fs"
import { join } from "path"

export function readVersion(callerDirname: string): string {
  for (const depth of [3, 4]) {
    try {
      const pkg = JSON.parse(readFileSync(join(callerDirname, ...Array(depth).fill(".."), "package.json"), "utf-8"))
      if (pkg.version && pkg.name?.startsWith("@hashgraph/")) return pkg.version
    } catch {
      /* try next depth */
    }
  }
  return "unknown"
}
