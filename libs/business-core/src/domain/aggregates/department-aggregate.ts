import { EntityId, TenantId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { Department } from "../entities/department/department.entity.js";
import { DepartmentLevel } from "../value-objects/types/department-level.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { InvalidDepartmentNameException, InvalidDepartmentLevelException, DepartmentStateException } from "../exceptions/business-exceptions.js";

/**
 * 部门聚合根
 *
 * @description 管理部门及其下属子部门的生命周期，协调部门层级相关的业务操作。
 * 部门聚合根负责维护部门与子部门之间的层级关系，确保业务规则的一致性。
 *
 * @since 1.0.0
 */
export class DepartmentAggregate extends IsolationAwareAggregateRoot {
  private department: Department;
  private subDepartments: Department[] = [];
  private _exceptionFactory: ExceptionFactory;

  /**
   * 构造函数
   *
   * @param id - 聚合根标识符
   * @param tenantId - 租户标识符
   * @param department - 部门实体
   * @param audit - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    department: Department,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.department = department;
    this.validate();
  }

  /**
   * 获取部门实体
   *
   * @returns 部门实体
   */
  getDepartment(): Department {
    return this.department;
  }

  /**
   * 获取子部门列表
   *
   * @returns 子部门列表
   */
  getSubDepartments(): Department[] {
    return [...this.subDepartments];
  }

  /**
   * 重命名部门
   *
   * @param newName - 新的部门名称
   */
  renameDepartment(newName: string): void {
    this.validateDepartmentName(newName);
    this.department.updateName(newName);
    this.updateTimestamp();
    this.logOperation("renameDepartment", { name: newName });
  }

  /**
   * 更新部门描述
   *
   * @param description - 新的描述
   */
  updateDescription(description: string): void {
    this.department.updateDescription(description);
    this.updateTimestamp();
    this.logOperation("updateDescription", { description });
  }

  /**
   * 设置部门负责人
   *
   * @param managerId - 负责人ID
   */
  setManager(managerId: EntityId): void {
    this.department.setManager(managerId);
    this.updateTimestamp();
    this.logOperation("setManager", { managerId: managerId.toString() });
  }

  /**
   * 添加子部门
   *
   * @param subDepartment - 子部门实体
   */
  addSubDepartment(subDepartment: Department): void {
    this.validateSubDepartmentAddition(subDepartment);
    this.subDepartments.push(subDepartment);
    this.updateTimestamp();
    this.logOperation("addSubDepartment", {
      subDepartmentId: subDepartment.id.toString(),
      subDepartmentName: subDepartment.name,
    });
  }

  /**
   * 移除子部门
   *
   * @param subDepartmentId - 子部门ID
   */
  removeSubDepartment(subDepartmentId: EntityId): void {
    const index = this.subDepartments.findIndex((d) =>
      d.id.equals(subDepartmentId),
    );
    if (index === -1) {
      throw this._exceptionFactory.createDomainState("子部门不存在", "active", "removeSubDepartment", { subDepartmentId: subDepartmentId.value });
    }

    const subDepartment = this.subDepartments[index];
    this.subDepartments.splice(index, 1);
    this.updateTimestamp();
    this.logOperation("removeSubDepartment", {
      subDepartmentId: subDepartmentId.toString(),
      subDepartmentName: subDepartment.name,
    });
  }

  /**
   * 激活部门
   */
  activateDepartment(): void {
    this.department.activate();
    this.updateTimestamp();
    this.logOperation("activateDepartment");
  }

  /**
   * 停用部门
   */
  deactivateDepartment(): void {
    this.department.deactivate();
    this.updateTimestamp();
    this.logOperation("deactivateDepartment");
  }

  /**
   * 检查是否有子部门
   *
   * @returns 是否有子部门
   */
  hasSubDepartments(): boolean {
    return this.subDepartments.length > 0;
  }

  /**
   * 获取子部门数量
   *
   * @returns 子部门数量
   */
  getSubDepartmentCount(): number {
    return this.subDepartments.length;
  }

  /**
   * 获取最大子部门层级
   *
   * @returns 最大子部门层级
   */
  getMaxSubDepartmentLevel(): number {
    if (this.subDepartments.length === 0) {
      return this.department.level.value;
    }
    return Math.max(...this.subDepartments.map((d) => d.level.value));
  }

  /**
   * 验证聚合根
   *
   * @protected
   */
  protected override validate(): void {
    super.validate();
    this.validateDepartment();
    this.validateSubDepartments();
  }

  /**
   * 验证部门实体
   *
   * @private
   */
  private validateDepartment(): void {
    if (!this.department) {
      throw this._exceptionFactory.createDomainValidation("部门实体不能为空", "department", department);
    }
    if (!this.department.id) {
      throw this._exceptionFactory.createDomainValidation("部门ID不能为空", "departmentId", this.department.id);
    }
  }

  /**
   * 验证子部门列表
   *
   * @private
   */
  private validateSubDepartments(): void {
    for (const subDepartment of this.subDepartments) {
      this.validateSubDepartment(subDepartment);
    }
  }

  /**
   * 验证子部门
   *
   * @private
   */
  private validateSubDepartment(subDepartment: Department): void {
    if (!subDepartment) {
      throw this._exceptionFactory.createDomainValidation("子部门不能为空", "subDepartments", subDepartments);
    }
    if (!subDepartment.id) {
      throw this._exceptionFactory.createDomainValidation("子部门ID不能为空", "subDepartmentId", subDepartment.id);
    }
    this.validateSubDepartmentHierarchy(subDepartment, this.department);
  }

  /**
   * 验证子部门层级关系
   *
   * @private
   */
  private validateSubDepartmentHierarchy(
    subDepartment: Department,
    parentDepartment: Department,
  ): void {
    if (subDepartment.id.equals(parentDepartment.id)) {
      throw this._exceptionFactory.createDomainState("子部门不能设置自己为父部门", "active", "addSubDepartment", { subDepartmentId: subDepartment.id.value, parentDepartmentId: parentDepartment.id.value });
    }

    if (subDepartment.level.value <= parentDepartment.level.value) {
      throw this._exceptionFactory.createInvalidDepartmentLevel(subDepartment.level.value, parentDepartment.level.value);
    }
  }

  /**
   * 验证部门名称
   *
   * @private
   */
  private validateDepartmentName(name: string): void {
    if (!name || !name.trim()) {
      throw this._exceptionFactory.createInvalidDepartmentName(name, "部门名称不能为空");
    }
    if (name.trim().length > 100) {
      throw this._exceptionFactory.createInvalidDepartmentName(name, "部门名称长度不能超过100个字符");
    }
  }

  /**
   * 验证子部门添加
   *
   * @private
   */
  private validateSubDepartmentAddition(subDepartment: Department): void {
    this.validateSubDepartment(subDepartment);

    const maxLevel = this.getMaxSubDepartmentLevel();
    if (subDepartment.level.value > maxLevel + 1) {
      throw this._exceptionFactory.createInvalidDepartmentLevel(subDepartment.level.value, parentDepartment.level.value + 1);
    }

    if (subDepartment.level.value > 8) {
      throw this._exceptionFactory.createInvalidDepartmentLevel(subDepartment.level.value, 8);
    }
  }
}
