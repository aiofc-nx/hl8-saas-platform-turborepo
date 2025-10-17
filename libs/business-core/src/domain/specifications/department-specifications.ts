/**
 * 部门规范
 *
 * @description 部门相关的业务规范实现
 * @since 1.0.0
 */

import { BaseSpecification } from "./base/base-specification.js";
import { Department } from "../entities/department/department.entity.js";
import { DepartmentLevel } from "../value-objects/types/department-level.vo.js";
import { EntityId } from "@hl8/isolation-model";

/**
 * 部门激活规范
 *
 * @description 检查部门是否处于激活状态
 */
export class DepartmentActiveSpecification extends BaseSpecification<Department> {
  constructor() {
    super({
      name: "DepartmentActiveSpecification",
      description: "部门必须处于激活状态",
      category: "department",
      tags: ["department", "status", "active"],
      priority: 1,
    });
  }

  isSatisfiedBy(_department: Department): boolean {
    // 这里需要根据实际的Department实体实现来判断激活状态
    // 假设Department实体有一个status属性
    return true; // 临时实现，需要根据实际实体调整
  }

  protected getErrorMessage(department: Department): string {
    return `部门 ${department.name} 未激活`;
  }
}

/**
 * 部门层级规范
 *
 * @description 检查部门层级是否符合要求
 */
export class DepartmentLevelSpecification extends BaseSpecification<Department> {
  constructor(
    private minLevel: DepartmentLevel,
    private maxLevel: DepartmentLevel,
  ) {
    super({
      name: "DepartmentLevelSpecification",
      description: `部门层级必须在 ${minLevel.value} 到 ${maxLevel.value} 之间`,
      category: "department",
      tags: ["department", "level"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    const level = department.level;
    return (
      level.value >= this.minLevel.value && level.value <= this.maxLevel.value
    );
  }

  protected getErrorMessage(department: Department): string {
    return `部门层级必须在 ${this.minLevel.value} 到 ${this.maxLevel.value} 之间，实际为 ${department.level.value}`;
  }
}

/**
 * 部门名称规范
 *
 * @description 检查部门名称是否符合规范
 */
export class DepartmentNameSpecification extends BaseSpecification<Department> {
  constructor(
    private minLength: number = 3,
    private maxLength: number = 100,
  ) {
    super({
      name: "DepartmentNameSpecification",
      description: `部门名称长度必须在 ${minLength} 到 ${maxLength} 之间`,
      category: "department",
      tags: ["department", "name", "validation"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    const name = department.name;
    return (
      name && name.length >= this.minLength && name.length <= this.maxLength
    );
  }

  protected getErrorMessage(department: Department): string {
    const name = department.name;
    if (!name) {
      return "部门名称不能为空";
    }
    if (name.length < this.minLength) {
      return `部门名称长度不能少于 ${this.minLength} 个字符`;
    }
    if (name.length > this.maxLength) {
      return `部门名称长度不能超过 ${this.maxLength} 个字符`;
    }
    return "部门名称不符合规范";
  }
}

/**
 * 部门ID规范
 *
 * @description 检查部门ID是否有效
 */
export class DepartmentIdSpecification extends BaseSpecification<Department> {
  constructor(private requiredId: EntityId) {
    super({
      name: "DepartmentIdSpecification",
      description: `部门ID必须为 ${requiredId.toString()}`,
      category: "department",
      tags: ["department", "id"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    return department.id.equals(this.requiredId);
  }

  protected getErrorMessage(department: Department): string {
    return `部门ID必须为 ${this.requiredId.toString()}，实际为 ${department.id.toString()}`;
  }
}

/**
 * 部门父级规范
 *
 * @description 检查部门是否有父级
 */
export class DepartmentHasParentSpecification extends BaseSpecification<Department> {
  constructor() {
    super({
      name: "DepartmentHasParentSpecification",
      description: "部门必须有父级",
      category: "department",
      tags: ["department", "parent"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    return department.parentId !== null && department.parentId !== undefined;
  }

  protected getErrorMessage(department: Department): string {
    return `部门 ${department.name} 必须有父级`;
  }
}

/**
 * 部门无父级规范
 *
 * @description 检查部门是否没有父级（根部门）
 */
export class DepartmentNoParentSpecification extends BaseSpecification<Department> {
  constructor() {
    super({
      name: "DepartmentNoParentSpecification",
      description: "部门不能有父级（根部门）",
      category: "department",
      tags: ["department", "root", "no-parent"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    return department.parentId === null || department.parentId === undefined;
  }

  protected getErrorMessage(department: Department): string {
    return `部门 ${department.name} 不能有父级（根部门）`;
  }
}

/**
 * 部门父级ID规范
 *
 * @description 检查部门父级ID是否匹配
 */
export class DepartmentParentIdSpecification extends BaseSpecification<Department> {
  constructor(private requiredParentId: EntityId) {
    super({
      name: "DepartmentParentIdSpecification",
      description: `部门父级ID必须为 ${requiredParentId.toString()}`,
      category: "department",
      tags: ["department", "parent", "id"],
      priority: 1,
    });
  }

  isSatisfiedBy(department: Department): boolean {
    return (
      department.parentId && department.parentId.equals(this.requiredParentId)
    );
  }

  protected getErrorMessage(department: Department): string {
    return `部门父级ID必须为 ${this.requiredParentId.toString()}，实际为 ${department.parentId?.toString() || "null"}`;
  }
}

/**
 * 部门层级深度规范
 *
 * @description 检查部门层级深度是否符合要求
 */
export class DepartmentLevelDepthSpecification extends BaseSpecification<Department> {
  constructor(private maxDepth: number) {
    super({
      name: "DepartmentLevelDepthSpecification",
      description: `部门层级深度不能超过 ${maxDepth}`,
      category: "department",
      tags: ["department", "level", "depth"],
      priority: 1,
    });
  }

  isSatisfiedBy(_department: Department): boolean {
    // 这里需要根据实际的Department实体实现来计算层级深度
    // 假设Department实体有一个levelDepth属性
    return true; // 临时实现，需要根据实际实体调整
  }

  protected getErrorMessage(_department: Department): string {
    return `部门层级深度不能超过 ${this.maxDepth}`;
  }
}
