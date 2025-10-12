/**
 * KeyGenerator 单元测试
 */

import { KeyGenerator, IsolationContext } from './key-generator.util.js';

describe('KeyGenerator', () => {
  describe('generate', () => {
    it('应该生成平台级缓存键', () => {
      const key = KeyGenerator.generate('user', 'list');

      expect(key).toBe('hl8:cache:platform:user:list');
    });

    it('空上下文应该生成平台级缓存键', () => {
      const key = KeyGenerator.generate('user', 'list', {});

      expect(key).toBe('hl8:cache:platform:user:list');
    });

    it('应该生成租户级缓存键', () => {
      const context: IsolationContext = {
        tenantId: 'tenant-123',
      };

      const key = KeyGenerator.generate('user', 'list', context);

      expect(key).toBe('hl8:cache:tenant:tenant-123:user:list');
    });

    it('应该生成组织级缓存键', () => {
      const context: IsolationContext = {
        tenantId: 'tenant-123',
        organizationId: 'org-456',
      };

      const key = KeyGenerator.generate('user', 'list', context);

      expect(key).toBe('hl8:cache:org:tenant-123:org-456:user:list');
    });

    it('应该生成部门级缓存键', () => {
      const context: IsolationContext = {
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentId: 'dept-789',
      };

      const key = KeyGenerator.generate('user', 'list', context);

      expect(key).toBe('hl8:cache:dept:tenant-123:org-456:dept-789:user:list');
    });

    it('应该生成用户级缓存键', () => {
      const context: IsolationContext = {
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentId: 'dept-789',
        userId: 'user-001',
      };

      const key = KeyGenerator.generate('user', 'list', context);

      expect(key).toBe('hl8:cache:user:tenant-123:org-456:dept-789:user-001:user:list');
    });

    it('应该正确处理特殊字符', () => {
      const context: IsolationContext = {
        tenantId: 'tenant:123',
      };

      const key = KeyGenerator.generate('user:profile', 'detail', context);

      expect(key).toBe('hl8:cache:tenant:tenant:123:user:profile:detail');
    });
  });
});

