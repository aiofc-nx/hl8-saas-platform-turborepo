/**
 * 注册用户用例
 *
 * @description 处理用户注册的业务场景
 *
 * @class RegisterUserUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { UserId } from "@hl8/isolation-model";
import { Username } from "../../../../domain/user/value-objects/username.vo.js";
import { Email } from "../../../../domain/user/value-objects/email.vo.js";
import { PhoneNumber } from "../../../../domain/user/value-objects/phone-number.vo.js";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { UserAggregate } from "../../../domain/user/aggregates/user.aggregate.js";
import { IUserAggregateRepository } from "../../../domain/user/repositories/user-aggregate.repository.interface.js";

import { TenantId } from "@hl8/isolation-model";
export interface IRegisterUserCommand {
  tenantId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase
  implements ICommandUseCase<IRegisterUserCommand, UserId>
{
  constructor(private readonly userRepository: IUserAggregateRepository) {}

  async execute(command: IRegisterUserCommand): Promise<UserId> {
    const username = new (Username as any)(command.username);
    const email = new (Email as any)(command.email);
    const phoneNumber = command.phoneNumber
      ? new (PhoneNumber as any)(command.phoneNumber)
      : null;

    // 验证唯一性
    if (await (this.userRepository as any).existsByUsername(TenantId.create(command.tenantId), username)) {
      throw new Error(`用户名 ${command.username} 已存在`);
    }
    if (await (this.userRepository as any).existsByEmail(TenantId.create(command.tenantId), email)) {
      throw new Error(`邮箱 ${command.email} 已被注册`);
    }

    // TODO: 实际需要对密码进行哈希处理
    const passwordHash = command.password; // 示例，实际使用 bcrypt
    const passwordSalt = "salt"; // 示例

    const userId = UserId.generate();
    const aggregate = UserAggregate.create(
      userId,
      username,
      email,
      phoneNumber,
      passwordHash,
      passwordSalt,
      { createdBy: "system" },
    );

    await (this.userRepository as any).save(aggregate);
    return userId;
  }
}
