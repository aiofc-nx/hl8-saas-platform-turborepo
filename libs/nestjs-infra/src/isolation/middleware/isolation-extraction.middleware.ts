/**
 * 隔离上下文提取中间件
 *
 * @description 从请求头提取隔离标识并构建上下文
 *
 * @since 0.2.0
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { IsolationContextService } from '../services/isolation-context.service.js';
import { IsolationContext } from '../../shared/entities/isolation-context.entity.js';
import { TenantId } from '../../shared/value-objects/tenant-id.vo.js';
import { OrganizationId } from '../../shared/value-objects/organization-id.vo.js';
import { DepartmentId } from '../../shared/value-objects/department-id.vo.js';
import { UserId } from '../../shared/value-objects/user-id.vo.js';

/**
 * 隔离上下文提取中间件
 */
@Injectable()
export class IsolationExtractionMiddleware implements NestMiddleware {
  constructor(private readonly contextService: IsolationContextService) {}

  use(req: any, res: any, next: () => void): void {
    try {
      // 从请求头提取标识
      const tenantId = req.headers['x-tenant-id'] as string | undefined;
      const organizationId = req.headers['x-organization-id'] as string | undefined;
      const departmentId = req.headers['x-department-id'] as string | undefined;
      const userId = req.headers['x-user-id'] as string | undefined;

      // 构建上下文
      let context: IsolationContext;

      if (userId && departmentId && organizationId && tenantId) {
        context = IsolationContext.createUser(
          TenantId.create(tenantId),
          OrganizationId.create(organizationId),
          DepartmentId.create(departmentId),
          UserId.create(userId),
        );
      } else if (departmentId && organizationId && tenantId) {
        context = IsolationContext.createDepartment(
          TenantId.create(tenantId),
          OrganizationId.create(organizationId),
          DepartmentId.create(departmentId),
        );
      } else if (organizationId && tenantId) {
        context = IsolationContext.createOrganization(
          TenantId.create(tenantId),
          OrganizationId.create(organizationId),
        );
      } else if (tenantId) {
        context = IsolationContext.createTenant(TenantId.create(tenantId));
      } else {
        // 平台级
        context = IsolationContext.createPlatform();
      }

      // 设置上下文
      this.contextService.setIsolationContext(context);
      next();
    } catch (error) {
      // 错误处理
      throw error;
    }
  }
}

