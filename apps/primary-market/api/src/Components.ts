import { AppService } from "./AppService";
import { AppController } from "./AppController";
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener";
import { Provider } from "@nestjs/common";

const REPOSITORIES: Provider[] = []

export const CONTROLLERS = [AppController]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES]
