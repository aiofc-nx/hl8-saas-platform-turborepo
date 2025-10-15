import { QueryHandler, IQueryHandler } from "@hl8/hybrid-archi";
import { GetUserQuery } from "./get-user.query.js";
import { IUserAggregateRepository } from "../../../../domain/user/repositories/user-aggregate.repository.interface.js";
import { UserAggregate } from "../../../../domain/user/aggregates/user.aggregate.js";
import { UserId } from "@hl8/isolation-model";

// @QueryHandler('GetUserQuery') // TODO: 修复装饰器类型问题
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, any>
{
  constructor(private readonly repository: IUserAggregateRepository) {}

  async execute(query: GetUserQuery): Promise<UserAggregate | null> {
    const userId = UserId.create(query.targetUserId);
    return await (this.repository as any).findById(userId);
  }
}
