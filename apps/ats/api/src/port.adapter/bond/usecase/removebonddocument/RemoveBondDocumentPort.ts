import { DocumentRemovedDLTEvent } from "@port/bond/usecase/removebonddocument/model/DocumentRemovedDLTEvent"

export interface RemoveBondDocumentPort {
  handle(event: DocumentRemovedDLTEvent): Promise<void>
}
