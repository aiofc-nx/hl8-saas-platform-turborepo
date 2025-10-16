import { Ability, AbilityBuilder, MongoQuery } from '@casl/ability';
import type { Subject } from '@casl/ability';

/**
 * 权限服务（CASL能力构建器封装）
 *
 * @description 基于 CASL 的权限计算与合并入口。应用层/适配器应通过本服务创建用户的 Ability。
 * 领域层请勿直接依赖本实现（保持纯净），仅在基础设施或接口层使用。
 */
export class PermissionService {
  /**
   * 基于权限定义集合构建 Ability
   */
  buildAbility(definitions: Array<{ action: string; subject: Subject; conditions?: MongoQuery }>): Ability {
    const { can, cannot, build } = new AbilityBuilder<Ability>(Ability as any);

    for (const def of definitions) {
      if (def.conditions) {
        can(def.action as any, def.subject as any, def.conditions);
      } else {
        can(def.action as any, def.subject as any);
      }
    }

    // 示例：保留接口以便后续策略加入 cannot 规则
    // cannot('delete', 'Tenant', { protected: true });

    return build({ detectSubjectType: (item) => (item as any).type || (item as any).constructor?.name });
  }
}


