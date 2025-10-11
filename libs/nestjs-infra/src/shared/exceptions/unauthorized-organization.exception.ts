/**
 * 未授权访问组织异常
 *
 * @since 0.2.0
 */

import { AbstractHttpException } from '../../exceptions/core/abstract-http.exception';

export class UnauthorizedOrganizationException extends AbstractHttpException {
  constructor(organizationId: string) {
    super(
      'UNAUTHORIZED_ORGANIZATION',
      '未授权的组织访问',
      `您没有权限访问组织 "${organizationId}"`,
      403,
      { organizationId },
    );
  }
}

