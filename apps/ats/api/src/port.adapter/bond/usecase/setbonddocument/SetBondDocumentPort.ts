import {DocumentUpdatedDLTEvent} from "@port/bond/usecase/setbonddocument/model/DocumentUpdatedDLTEvent";

export interface SetBondDocumentPort {
  handle(event: DocumentUpdatedDLTEvent): Promise<void>
}
