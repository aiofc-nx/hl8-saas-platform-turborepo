/**
 * 隔离守卫
 *
 * @description 验证隔离上下文有效性
 *
 * @since 0.2.0
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsolationContextService } from '../services/isolation-context.service.js';
import { IsolationLevel } from '@hl8/platform';
import { InvalidIsolationContextException } from '../../exceptions/core/invalid-isolation-context.exception.js';

/**
 * 隔离守卫元数据键
 */
export const REQUIRED_ISOLATION_LEVEL = 'requiredIsolationLevel';

/**
 * 隔离守卫
 */
@Injectable()
export class IsolationGuard implements CanActivate {
  constructor(
    private readonly contextService: IsolationContextService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<IsolationLevel>(
      REQUIRED_ISOLATION_LEVEL,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredLevel) {
      return true; // 无要求，放行
    }

    const isolationContext = this.contextService.getIsolationContext();
    
    if (!isolationContext || !isolationContext.validate()) {
      throw new InvalidIsolationContextException('隔离上下文无效或缺失');
    }

    return true;
  }
}

