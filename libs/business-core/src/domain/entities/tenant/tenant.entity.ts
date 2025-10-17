import { BaseEntity } from "../base/base-entity.js";
import { EntityId, TenantId } from "@hl8/isolation-model";
import type { IPureLogger } from "@hl8/pure-logger";
import { TenantType } from "../../value-objects/types/tenant-type.vo.js";
import type { IPartialAuditInfo } from "../base/audit-info.js";
import { BusinessRuleFactory } from "../../rules/business-rule-factory.js";
import { BusinessRuleManager } from "../../rules/business-rule-manager.js";
import { ValidationService } from "../../validators/validation-service.js";
import { SpecificationFactory } from "../../specifications/specification-factory.js";
import {
  TenantActiveSpecification,
  TenantTypeSpecification,
  TenantNameSpecification,
} from "../../specifications/tenant-specifications.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
/**
 * 租户实体（Tenant）
 *
 * @description 表达 SAAS 平台中的租户（企业/社群/团队/个人），承载租户生命周期与配置变更规则。
 *
 * 业务规则：
 * - 必须隶属于平台（由上层聚合或上下文保证）
 * - 必须具备租户类型（TenantType）
 * - 名称非空且长度受限
 * - 支持软删除恢复
 */
export class Tenant extends BaseEntity {
  private _name: string;
  private _type: TenantType;
  private _ruleManager: BusinessRuleManager;
  private _validationService: ValidationService;
  private _specificationFactory: SpecificationFactory;
  private _exceptionFactory: ExceptionFactory;

  constructor(
    id: EntityId,
    props: { name: string; type: TenantType },
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._ruleManager = BusinessRuleFactory.createTenantManager();
    this._validationService = new ValidationService();
    this._specificationFactory = SpecificationFactory.getInstance();
    this._exceptionFactory = ExceptionFactory.getInstance();
    this._name = props.name;
    this._type = props.type;
    this.validate();
  }

  get name(): string {
    return this._name;
  }

  get type(): TenantType {
    return this._type;
  }

  rename(newName: string): void {
    this.validateNameWithRules(newName);
    this._name = newName.trim();
    this.updateTimestamp();
    this.logOperation("rename", { name: this._name });
  }

  changeType(newType: TenantType): void {
    if (!newType) {
      throw this._exceptionFactory.createInvalidTenantType("租户类型不能为空");
    }
    this._type = newType;
    this.updateTimestamp();
    this.logOperation("changeType", { type: newType.value });
  }

  protected override validate(): void {
    super.validate();
    this.validateNameWithRules(this._name);
    if (!(this.type instanceof TenantType)) {
      throw this._exceptionFactory.createInvalidTenantType("租户类型无效");
    }
  }

  /**
   * 使用业务规则、验证器和规范模式验证租户名称
   *
   * @param name - 租户名称
   * @throws {Error} 当验证失败时抛出错误
   */
  private validateNameWithRules(name: string): void {
    // 使用验证服务进行统一验证
    const validationResult = this._validationService.validateTenantName(name);

    if (!validationResult.isValid) {
      throw this._exceptionFactory.createInvalidTenantName(
        name,
        validationResult.errors.join(", "),
      );
    }

    // 使用规范模式进行业务逻辑验证
    const nameSpec = new TenantNameSpecification(3, 100);
    const nameResult = nameSpec.check(this);

    if (!nameResult.isSatisfied) {
      throw this._exceptionFactory.createInvalidTenantName(
        name,
        nameResult.errorMessage || "租户名称规范不满足",
      );
    }
  }

  /**
   * 获取业务规则管理器
   *
   * @returns 业务规则管理器
   */
  getRuleManager(): BusinessRuleManager {
    return this._ruleManager;
  }

  /**
   * 获取规范工厂
   *
   * @returns 规范工厂
   */
  getSpecificationFactory(): SpecificationFactory {
    return this._specificationFactory;
  }

  /**
   * 检查租户是否满足激活规范
   *
   * @returns 是否满足激活规范
   */
  isActive(): boolean {
    const activeSpec = new TenantActiveSpecification();
    return activeSpec.isSatisfiedBy(this);
  }

  /**
   * 检查租户类型是否匹配
   *
   * @param type - 租户类型
   * @returns 是否匹配
   */
  isType(type: TenantType): boolean {
    const typeSpec = new TenantTypeSpecification(type);
    return typeSpec.isSatisfiedBy(this);
  }

  /**
   * 检查租户是否为企业或社区类型
   *
   * @returns 是否为企业或社区类型
   */
  isEnterpriseOrCommunity(): boolean {
    const enterpriseSpec = new TenantTypeSpecification(TenantType.ENTERPRISE);
    const communitySpec = new TenantTypeSpecification(TenantType.COMMUNITY);
    const combinedSpec = enterpriseSpec.or(communitySpec);
    return combinedSpec.isSatisfiedBy(this);
  }

  /**
   * 检查租户名称是否符合规范
   *
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @returns 是否符合规范
   */
  isNameValid(minLength: number = 3, maxLength: number = 100): boolean {
    const nameSpec = new TenantNameSpecification(minLength, maxLength);
    return nameSpec.isSatisfiedBy(this);
  }

  /**
   * 获取租户规范检查结果
   *
   * @returns 规范检查结果
   */
  getSpecificationResults(): Array<{
    name: string;
    satisfied: boolean;
    errorMessage?: string;
  }> {
    const results: Array<{
      name: string;
      satisfied: boolean;
      errorMessage?: string;
    }> = [];

    // 检查激活规范
    const activeSpec = new TenantActiveSpecification();
    const activeResult = activeSpec.check(this);
    results.push({
      name: "激活规范",
      satisfied: activeResult.isSatisfied,
      errorMessage: activeResult.errorMessage,
    });

    // 检查类型规范
    const typeSpec = new TenantTypeSpecification(this._type);
    const typeResult = typeSpec.check(this);
    results.push({
      name: "类型规范",
      satisfied: typeResult.isSatisfied,
      errorMessage: typeResult.errorMessage,
    });

    // 检查名称规范
    const nameSpec = new TenantNameSpecification();
    const nameResult = nameSpec.check(this);
    results.push({
      name: "名称规范",
      satisfied: nameResult.isSatisfied,
      errorMessage: nameResult.errorMessage,
    });

    return results;
  }
}
