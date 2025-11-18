// SPDX-License-Identifier: Apache-2.0
import { IsString, IsNotEmpty } from "class-validator";

export class ProjectRequest {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  topicId: string;
}
