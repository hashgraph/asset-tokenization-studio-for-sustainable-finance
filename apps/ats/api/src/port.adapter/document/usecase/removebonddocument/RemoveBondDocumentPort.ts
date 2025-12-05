import { DocumentRemovedDLTEvent } from "@port/document/usecase/removebonddocument/model/DocumentRemovedDLTEvent"

export interface RemoveBondDocumentPort {
  handle(event: DocumentRemovedDLTEvent): Promise<void>
}
