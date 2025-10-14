/**
 * IsolationContextSwitchedEvent 事件单元测试
 */

import { IsolationContext } from '../entities/isolation-context.entity.js';
import { TenantId } from '../value-objects/tenant-id.vo.js';
import { IsolationContextSwitchedEvent } from './context-switched.event.js';

describe('IsolationContextSwitchedEvent', () => {
  it('应该创建事件', () => {
    const from = IsolationContext.platform();
    const to = IsolationContext.tenant(
      TenantId.create('550e8400-e29b-41d4-a716-446655440000'),
    );
    const event = new IsolationContextSwitchedEvent(from, to, 'user-switch');

    expect(event.from).toBe(from);
    expect(event.to).toBe(to);
    expect(event.reason).toBe('user-switch');
  });
});
