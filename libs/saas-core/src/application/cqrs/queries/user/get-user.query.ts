/**
 * 获取用户查询
 *
 * @description 获取单个用户的查询对象
 *
 * @class GetUserQuery
 * @since 1.0.0
 */

import { BaseQuery } from "@hl8/hybrid-archi";

export class GetUserQuery extends BaseQuery {
  constructor(
    tenantId: string,
    userId: string,
    public readonly targetUserId: string,
  ) {
    super(tenantId, userId);
  }

  get queryType(): string {
    return "GetUserQuery";
  }

  protected createCopyWithSortRules(sortRules: any[]): this {
    const copy = new GetUserQuery(
      (this as any).tenantId,
      (this as any).userId,
      this.targetUserId,
    );
    return copy as this;
  }
}