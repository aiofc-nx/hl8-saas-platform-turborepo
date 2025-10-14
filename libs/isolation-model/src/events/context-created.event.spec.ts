/**
 * IsolationContextCreatedEvent 事件单元测试
 */

import { IsolationContext } from '../entities/isolation-context.entity.js';
import { TenantId } from '../value-objects/tenant-id.vo.js';
import { IsolationContextCreatedEvent } from './context-created.event.js';

describe('IsolationContextCreatedEvent', () => {
  const UUID_TENANT = '550e8400-e29b-41d4-a716-446655440000';

  it('应该创建事件', () => {
    const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
    const event = new IsolationContextCreatedEvent(context, 'req-123');

    expect(event.context).toBe(context);
    expect(event.requestId).toBe('req-123');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});
