/**
 * 隔离上下文提取中间件
 *
 * @description 从请求头中提取隔离标识符并创建隔离上下文
 *
 * ## 业务规则
 *
 * ### 请求头格式
 * - X-Tenant-Id: 租户 ID（UUID v4）
 * - X-Organization-Id: 组织 ID（UUID v4）
 * - X-Department-Id: 部门 ID（UUID v4）
 * - X-User-Id: 用户 ID（UUID v4）
 *
 * ### 层级判断规则
 * 1. 如果有 departmentId + organizationId + tenantId → DEPARTMENT 级
 * 2. 如果有 organizationId + tenantId → ORGANIZATION 级
 * 3. 如果有 tenantId → TENANT 级
 * 4. 如果有 userId → USER 级
 * 5. 默认 → PLATFORM 级
 *
 * ### 错误处理
 * - ID 格式无效时，记录警告并降级到平台级
 * - 缺少必需层级时（如组织级缺少租户），降级处理
 *
 * @since 1.0.0
 */

import {
  DepartmentId,
  IsolationContext,
  IsolationValidationError,
  OrganizationId,
  TenantId,
  UserId,
} from '@hl8/isolation-model';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { IsolationContextService } from '../services/isolation-context.service.js';

@Injectable()
export class IsolationExtractionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IsolationExtractionMiddleware.name);

  constructor(private readonly contextService: IsolationContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // 提取请求头中的标识符
      const tenantId = this.extractHeader(req, 'x-tenant-id');
      const orgId = this.extractHeader(req, 'x-organization-id');
      const deptId = this.extractHeader(req, 'x-department-id');
      const userId = this.extractHeader(req, 'x-user-id');

      // 创建隔离上下文
      const context = this.createIsolationContext(
        tenantId,
        orgId,
        deptId,
        userId,
      );

      // 存储到 CLS
      this.contextService.setIsolationContext(context);

      // 记录日志（仅在开发环境）
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(
          `Isolation context created: ${context.getIsolationLevel()}`,
          context.buildLogContext(),
        );
      }

      next();
    } catch (error) {
      // 验证错误时，降级到平台级
      if (error instanceof IsolationValidationError) {
        this.logger.warn(
          `Invalid isolation identifier: ${error.message}, falling back to PLATFORM level`,
          { code: error.code, context: error.context },
        );
        this.contextService.setIsolationContext(IsolationContext.platform());
        next();
      } else {
        // 其他错误传递给错误处理器
        next(error);
      }
    }
  }

  /**
   * 提取请求头
   *
   * @param req - 请求对象
   * @param headerName - 请求头名称
   * @returns 请求头值或 undefined
   * @private
   */
  private extractHeader(req: Request, headerName: string): string | undefined {
    const value = req.headers[headerName];

    if (Array.isArray(value)) {
      return value[0]; // 取第一个值
    }

    return value;
  }

  /**
   * 创建隔离上下文
   *
   * @param tenantId - 租户 ID 字符串
   * @param orgId - 组织 ID 字符串
   * @param deptId - 部门 ID 字符串
   * @param userId - 用户 ID 字符串
   * @returns 隔离上下文实例
   * @private
   */
  private createIsolationContext(
    tenantId?: string,
    orgId?: string,
    deptId?: string,
    userId?: string,
  ): IsolationContext {
    // 部门级（需要租户、组织、部门）
    if (deptId && orgId && tenantId) {
      return IsolationContext.department(
        TenantId.create(tenantId),
        OrganizationId.create(orgId),
        DepartmentId.create(deptId),
      );
    }

    // 组织级（需要租户、组织）
    if (orgId && tenantId) {
      return IsolationContext.organization(
        TenantId.create(tenantId),
        OrganizationId.create(orgId),
      );
    }

    // 租户级（需要租户）
    if (tenantId) {
      return IsolationContext.tenant(TenantId.create(tenantId));
    }

    // 用户级（用户 ID，可选租户）
    if (userId) {
      const userIdVO = UserId.create(userId);
      const tenantIdVO = tenantId ? TenantId.create(tenantId) : undefined;
      return IsolationContext.user(userIdVO, tenantIdVO);
    }

    // 平台级（无标识符）
    return IsolationContext.platform();
  }
}
