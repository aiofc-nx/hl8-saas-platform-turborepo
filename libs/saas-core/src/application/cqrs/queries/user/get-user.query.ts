/**
 * 获取用户查询
 *
 * @description 获取单个用户的查询对象
 *
 * @class GetUserQuery
 * @since 1.0.0
 */

import { IQuery } from "@hl8/hybrid-archi";

export interface GetUserQueryParams {
  /** 租户ID */
  tenantId: string;
  /** 用户ID */
  userId: string;
}

export class GetUserQuery implements IQuery {
  public readonly tenantId: string;
  public readonly userId: string;

  constructor(params: GetUserQueryParams) {
    this.tenantId = params.tenantId;
    this.userId = params.userId;
  }
}