import { EntityId, TenantId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { Organization } from "../entities/organization/organization.entity.js";
import { Department } from "../entities/department/department.entity.js";
import { OrganizationType } from "../value-objects/types/organization-type.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
/**
 * 组织聚合根
 *
 * @description 管理组织及其下属部门的生命周期，协调组织层级相关的业务操作。
 * 组织聚合根负责维护组织与部门之间的层级关系，确保业务规则的一致性。
 *
 * @since 1.0.0
 */
export class OrganizationAggregate extends IsolationAwareAggregateRoot {
  private organization: Organization;
  private departments: Department[] = [];
  private _exceptionFactory: ExceptionFactory;

  /**
   * 构造函数
   *
   * @param id - 聚合根标识符
   * @param tenantId - 租户标识符
   * @param organization - 组织实体
   * @param audit - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    organization: Organization,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.organization = organization;
    this.validate();
  }

  /**
   * 获取组织实体
   *
   * @returns 组织实体
   */
  getOrganization(): Organization {
    return this.organization;
  }

  /**
   * 获取部门列表
   *
   * @returns 部门列表
   */
  getDepartments(): Department[] {
    return [...this.departments];
  }

  /**
   * 重命名组织
   *
   * @param newName - 新的组织名称
   */
  renameOrganization(newName: string): void {
    this.validateOrganizationName(newName);
    this.organization.updateName(newName);
    this.updateTimestamp();
    this.logOperation("renameOrganization", { name: newName });
  }

  /**
   * 更新组织描述
   *
   * @param description - 新的描述
   */
  updateDescription(description: string): void {
    this.organization.updateDescription(description);
    this.updateTimestamp();
    this.logOperation("updateDescription", { description });
  }

  /**
   * 设置组织负责人
   *
   * @param managerId - 负责人ID
   */
  setManager(managerId: EntityId): void {
    // TODO: 实现设置组织负责人的逻辑
    this.updateTimestamp();
    this.logOperation("setManager", { managerId: managerId.toString() });
  }

  /**
   * 添加部门
   *
   * @param department - 部门实体
   */
  addDepartment(department: Department): void {
    this.validateDepartmentAddition(department);
    this.departments.push(department);
    this.updateTimestamp();
    this.logOperation("addDepartment", {
      departmentId: department.id.toString(),
      departmentName: department.name,
    });
  }

  /**
   * 移除部门
   *
   * @param departmentId - 部门ID
   */
  removeDepartment(departmentId: EntityId): void {
    const index = this.departments.findIndex((d) => d.id.equals(departmentId));
    if (index === -1) {
      throw this._exceptionFactory.createDomainState(
        "部门不存在",
        "active",
        "removeDepartment",
        { departmentId: departmentId.toString() },
      );
    }

    const department = this.departments[index];
    this.departments.splice(index, 1);
    this.updateTimestamp();
    this.logOperation("removeDepartment", {
      departmentId: departmentId.toString(),
      departmentName: department.name,
    });
  }

  /**
   * 激活组织
   */
  activateOrganization(): void {
    this.organization.activate();
    this.updateTimestamp();
    this.logOperation("activateOrganization");
  }

  /**
   * 停用组织
   */
  deactivateOrganization(): void {
    this.organization.deactivate();
    this.updateTimestamp();
    this.logOperation("deactivateOrganization");
  }

  /**
   * 检查是否有部门
   *
   * @returns 是否有部门
   */
  hasDepartments(): boolean {
    return this.departments.length > 0;
  }

  /**
   * 获取部门数量
   *
   * @returns 部门数量
   */
  getDepartmentCount(): number {
    return this.departments.length;
  }

  /**
   * 验证聚合根
   *
   * @protected
   */
  protected override validate(): void {
    super.validate();
    this.validateOrganization();
    this.validateDepartments();
  }

  /**
   * 验证组织实体
   *
   * @private
   */
  private validateOrganization(): void {
    if (!this.organization) {
      throw this._exceptionFactory.createDomainValidation(
        "组织实体不能为空",
        "organization",
        this.organization,
      );
    }
    if (!this.organization.id) {
      throw this._exceptionFactory.createDomainValidation(
        "组织ID不能为空",
        "organizationId",
        this.organization.id,
      );
    }
  }

  /**
   * 验证部门列表
   *
   * @private
   */
  private validateDepartments(): void {
    for (const department of this.departments) {
      this.validateDepartment(department);
    }
  }

  /**
   * 验证部门
   *
   * @private
   */
  private validateDepartment(department: Department): void {
    if (!department) {
      throw this._exceptionFactory.createDomainValidation(
        "部门不能为空",
        "departments",
        this.departments,
      );
    }
    if (!department.id) {
      throw this._exceptionFactory.createDomainValidation(
        "部门ID不能为空",
        "departmentId",
        department.id,
      );
    }
  }

  /**
   * 验证组织名称
   *
   * @private
   */
  private validateOrganizationName(name: string): void {
    if (!name || !name.trim()) {
      throw this._exceptionFactory.createInvalidOrganizationName(
        name,
        "组织名称不能为空",
      );
    }
    if (name.trim().length > 100) {
      throw this._exceptionFactory.createInvalidOrganizationName(
        name,
        "组织名称长度不能超过100个字符",
      );
    }
  }

  /**
   * 验证部门添加
   *
   * @private
   */
  private validateDepartmentAddition(department: Department): void {
    this.validateDepartment(department);

    const existingDepartment = this.departments.find(
      (d) => d.name === department.name,
    );
    if (existingDepartment) {
      throw this._exceptionFactory.createDomainValidation(
        "部门名称在同一组织内必须唯一",
        "departmentName",
        department.name,
      );
    }

    if (department.level.value > 8) {
      throw this._exceptionFactory.createDomainValidation(
        "部门层级不能超过8层",
        "departmentLevel",
        department.level.value,
      );
    }
  }
}
