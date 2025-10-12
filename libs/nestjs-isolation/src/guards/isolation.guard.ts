/**
 * 隔离上下文守卫
 * 
 * @description 验证当前请求是否满足所需的隔离级别
 * 
 * ## 业务规则
 * 
 * ### 层级验证规则
 * - 如果控制器方法标记了 @RequireTenant，则必须有租户上下文
 * - 如果标记了 @RequireOrganization，则必须有组织上下文
 * - 如果标记了 @RequireDepartment，则必须有部门上下文
 * - 没有标记时，不进行验证（允许所有级别）
 * 
 * ### 错误处理
 * - 验证失败时返回 403 Forbidden
 * - 错误消息清晰说明所需的隔离级别
 * 
 * @since 1.0.0
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsolationLevel, IsolationContext } from '@hl8/isolation-model';
import { REQUIRED_ISOLATION_LEVEL_KEY } from '../decorators/require-level.decorator.js';
import { IsolationContextService } from '../services/isolation-context.service.js';

@Injectable()
export class IsolationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly contextService: IsolationContextService,
  ) {}
  
  canActivate(context: ExecutionContext): boolean {
    // 读取方法或类级别的元数据
    const requiredLevel = this.reflector.getAllAndOverride<IsolationLevel | undefined>(
      REQUIRED_ISOLATION_LEVEL_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    // 没有要求，允许访问
    if (!requiredLevel) {
      return true;
    }
    
    // 获取当前隔离上下文
    const isolationContext = this.contextService.getIsolationContext();
    
    if (!isolationContext) {
      throw new ForbiddenException(
        `This endpoint requires ${requiredLevel} level isolation context, but no context found`
      );
    }
    
    // 验证隔离级别
    const hasRequiredLevel = this.checkIsolationLevel(isolationContext, requiredLevel);
    
    if (!hasRequiredLevel) {
      throw new ForbiddenException(
        `This endpoint requires ${requiredLevel} level isolation context, ` +
        `but current context is ${isolationContext.getIsolationLevel()}`
      );
    }
    
    return true;
  }
  
  /**
   * 检查当前上下文是否满足所需级别
   * 
   * @param context - 隔离上下文
   * @param requiredLevel - 所需级别
   * @returns true 如果满足要求
   * @private
   */
  private checkIsolationLevel(context: IsolationContext, requiredLevel: IsolationLevel): boolean {
    switch (requiredLevel) {
      case IsolationLevel.TENANT:
        return !!context.tenantId;
      
      case IsolationLevel.ORGANIZATION:
        return !!context.tenantId && !!context.organizationId;
      
      case IsolationLevel.DEPARTMENT:
        return !!context.tenantId && !!context.organizationId && !!context.departmentId;
      
      case IsolationLevel.USER:
        return !!context.userId;
      
      case IsolationLevel.PLATFORM:
        return true; // 平台级总是满足
      
      default:
        return false;
    }
  }
}

