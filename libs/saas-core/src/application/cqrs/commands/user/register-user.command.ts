import { BaseCommand } from "@hl8/business-core";

export class RegisterUserCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly phoneNumber?: string,
  ) {
    super(tenantId, userId);
  }

  get commandType(): string {
    return "RegisterUserCommand";
  }
}
