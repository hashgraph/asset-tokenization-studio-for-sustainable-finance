// SPDX-License-Identifier: Apache-2.0
import { DocumentRemovedDLTEvent } from "@port/bond/usecase/removebonddocument/model/DocumentRemovedDLTEvent"

export interface RemoveBondDocumentPort {
  handle(event: DocumentRemovedDLTEvent): Promise<void>
}
