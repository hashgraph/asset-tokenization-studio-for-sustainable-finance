import { DataSource } from "typeorm"
import { ENTITIES } from "../Components"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"

const configService = new ConfigService()

const Datasource = new DataSource({
  type: "postgres",
  host: configService.get<string>(ConfigKeys.POSTGRESQL_HOST),
  port: configService.get<number>(ConfigKeys.POSTGRESQL_PORT, 5432),
  username: configService.get<string>(ConfigKeys.POSTGRESQL_USER),
  password: configService.get(<string>ConfigKeys.POSTGRESQL_PASSWORD),
  database: configService.get<string>(ConfigKeys.POSTGRESQL_DB),
  entities: ENTITIES,
})

export default Datasource
