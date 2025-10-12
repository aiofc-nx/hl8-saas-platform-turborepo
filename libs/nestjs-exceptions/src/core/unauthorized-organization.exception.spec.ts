/**
 * UnauthorizedOrganizationException 单元测试
 */

import { UnauthorizedOrganizationException } from './unauthorized-organization.exception.js';

describe('UnauthorizedOrganizationException', () => {
  it('应该创建未授权组织异常', () => {
    const exception = new UnauthorizedOrganizationException(
      'org-123',
      '无权访问该组织',
    );

    expect(exception).toBeInstanceOf(UnauthorizedOrganizationException);
    expect(exception.errorCode).toBe('UNAUTHORIZED_ORGANIZATION');
    expect(exception.httpStatus).toBe(403);
  });

  it('应该包含组织 ID 在数据中', () => {
    const exception = new UnauthorizedOrganizationException(
      'org-456',
      '详细信息',
    );

    const rfc7807 = exception.toRFC7807();
    
    expect(rfc7807.data?.organizationId).toBe('org-456');
  });
});

