/**
 * 激活用户用例
 *
 * @class ActivateUserUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { UserId } from "@hl8/isolation-model/index.js";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { IUserAggregateRepository } from "../../../domain/user/repositories/user-aggregate.repository.interface.js";

export interface IActivateUserCommand {
  userId: string;
  activatedBy: string;
}

@Injectable()
export class ActivateUserUseCase
  implements ICommandUseCase<IActivateUserCommand, void>
{
  constructor(private readonly userRepository: IUserAggregateRepository) {}

  async execute(command: IActivateUserCommand): Promise<void> {
    const userId = UserId.create(command.userId);
    const aggregate = await (this.userRepository as any).findById(userId);

    if (!aggregate) {
      throw new Error(`用户不存在: ${command.userId}`);
    }

    aggregate.verifyEmail(command.activatedBy);
    await (this.userRepository as any).save(aggregate);
  }
}
