import { CommandHandler, ICommandHandler } from "@hl8/business-core";
import { RegisterUserCommand } from "./register-user.command.js";
import { RegisterUserUseCase } from "../../../use-cases/user/register-user.use-case.js";
import { EntityId } from "@hl8/business-core";

// @CommandHandler('RegisterUserCommand') // TODO: 修复装饰器类型问题
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, EntityId>
{
  constructor(private readonly useCase: RegisterUserUseCase) {}

  async execute(command: RegisterUserCommand): Promise<EntityId> {
    return await this.useCase.execute({
      tenantId: (command as any).tenantId,
      username: command.username,
      email: command.email,
      phoneNumber: command.phoneNumber,
      password: command.password,
    });
  }
}
