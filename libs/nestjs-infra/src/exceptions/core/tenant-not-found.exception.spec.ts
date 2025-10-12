/**
 * TenantNotFoundException 单元测试
 */

import { TenantNotFoundException } from './tenant-not-found.exception.js';

describe('TenantNotFoundException', () => {
  it('应该创建租户未找到异常', () => {
    const exception = new TenantNotFoundException('tenant-123', '租户不存在');

    expect(exception).toBeInstanceOf(TenantNotFoundException);
    expect(exception.errorCode).toBe('TENANT_NOT_FOUND');
    expect(exception.httpStatus).toBe(404);
  });

  it('应该包含租户 ID 在数据中', () => {
    const exception = new TenantNotFoundException('tenant-456', '详细信息');

    const rfc7807 = exception.toRFC7807();
    
    expect(rfc7807.data?.tenantId).toBe('tenant-456');
  });
});

