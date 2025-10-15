/**
 * 修改密码用例
 *
 * @class ChangePasswordUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { UserId } from "@hl8/isolation-model/index.js";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { IUserAggregateRepository } from "../../../domain/user/repositories/user-aggregate.repository.interface.js";

export interface IChangePasswordCommand {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase
  implements ICommandUseCase<IChangePasswordCommand, void>
{
  constructor(private readonly userRepository: IUserAggregateRepository) {}

  async execute(command: IChangePasswordCommand): Promise<void> {
    const userId = UserId.create(command.userId);
    const aggregate = await (this.userRepository as any).findById(userId);

    if (!aggregate) {
      throw new Error(`用户不存在: ${command.userId}`);
    }

    // TODO: 验证旧密码并哈希新密码
    // aggregate.getCredentials().changePassword(newHash, newSalt);

    await (this.userRepository as any).save(aggregate);
  }
}
