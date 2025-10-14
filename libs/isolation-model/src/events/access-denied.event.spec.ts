/**
 * DataAccessDeniedEvent 事件单元测试
 */

import { IsolationContext } from '../entities/isolation-context.entity.js';
import { TenantId } from '../value-objects/tenant-id.vo.js';
import { DataAccessDeniedEvent } from './access-denied.event.js';

describe('DataAccessDeniedEvent', () => {
  it('应该创建事件', () => {
    const userContext = IsolationContext.tenant(
      TenantId.create('550e8400-e29b-41d4-a716-446655440000'),
    );
    const dataContext = IsolationContext.tenant(
      TenantId.create('7c9e6679-7425-40de-944b-e07fc1f90ae7'),
    );
    const event = new DataAccessDeniedEvent(
      userContext,
      dataContext,
      'cross-tenant-access',
    );

    expect(event.userContext).toBe(userContext);
    expect(event.dataContext).toBe(dataContext);
    expect(event.reason).toBe('cross-tenant-access');
  });
});
