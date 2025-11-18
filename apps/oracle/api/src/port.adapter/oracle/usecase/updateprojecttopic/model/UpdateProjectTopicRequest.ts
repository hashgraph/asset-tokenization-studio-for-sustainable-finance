// SPDX-License-Identifier: Apache-2.0
import { IsString, IsNotEmpty } from "class-validator"

export class UpdateProjectTopicRequest {
  @IsString()
  @IsNotEmpty()
  topicId: string
}
