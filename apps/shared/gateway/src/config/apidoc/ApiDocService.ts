import axios from "axios"
import { OpenAPIObject } from "@nestjs/swagger"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class ApiDocService {
  async buildApiDoc(): Promise<OpenAPIObject> {
    const routes = Array.from(new Set(process.env.ROUTES.split(",")))
    const apiDocs = await Promise.all(routes.map((route) => this.getApiDoc(route)))
    return {
      info: {
        title: "Green Bonds API",
        description: "Greend Bonds REST API. Includes Treasury, Primary Market and ATS endpoints documentation",
        version: "1.0",
      },
      openapi: apiDocs[0].openapi,
      paths: Object.assign({}, ...apiDocs.map((apiDoc) => apiDoc.paths)),
      components: { schemas: Object.assign({}, ...apiDocs.map((apiDoc) => apiDoc.components.schemas)) },
    }
  }

  private async getApiDoc(route: string): Promise<OpenAPIObject> {
    const { data } = await axios.get(`${route}/api/v1/docs-json`)
    return data as OpenAPIObject
  }
}
