import { BaseCommand } from "@hl8/business-core";

export class LoginUserCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    public readonly email: string,
    public readonly password: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {
    super(tenantId, userId);
  }

  get commandType(): string {
    return "LoginUserCommand";
  }
}
