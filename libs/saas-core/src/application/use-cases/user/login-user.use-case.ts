/**
 * 用户登录用例
 *
 * @class LoginUserUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
// import { Email } from "../../../../domain/user/value-objects/email.vo";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { IUserAggregateRepository } from "../../../domain/user/repositories/user-aggregate.repository.interface.js";

export interface ILoginUserCommand {
  email: string;
  password: string;
  ip: string;
  userAgent: string;
}

export interface ILoginResult {
  userId: string;
  accessToken: string;
}

@Injectable()
export class LoginUserUseCase
  implements ICommandUseCase<ILoginUserCommand, ILoginResult>
{
  constructor(private readonly userRepository: IUserAggregateRepository) {}

  async execute(command: ILoginUserCommand): Promise<ILoginResult> {
    // const email = Email.create(command.email);
    const aggregate = await (this.userRepository as any).findByEmail(command.email);

    if (!aggregate) {
      throw new Error("用户名或密码错误");
    }

    // TODO: 实际需要验证密码哈希
    const isValid = aggregate.authenticate(command.password);

    if (!isValid) {
      aggregate.recordFailedLogin();
      await (this.userRepository as any).save(aggregate);
      throw new Error("用户名或密码错误");
    }

    aggregate.recordLogin();
    await (this.userRepository as any).save(aggregate);

    // TODO: 生成 JWT token
    return {
      userId: aggregate.id.toString(),
      accessToken: "mock-token",
    };
  }
}
