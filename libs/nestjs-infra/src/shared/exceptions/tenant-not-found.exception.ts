/**
 * 租户未找到异常
 *
 * @since 0.2.0
 */

import { AbstractHttpException } from '../../exceptions/core/abstract-http.exception';

export class TenantNotFoundException extends AbstractHttpException {
  constructor(tenantId: string) {
    super(
      'TENANT_NOT_FOUND',
      '租户未找到',
      `租户 ID "${tenantId}" 不存在`,
      404,
      { tenantId },
    );
  }
}

