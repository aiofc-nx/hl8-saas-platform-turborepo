/**
 * 租户配额验证服务
 *
 * @description 验证租户资源配额，确保租户使用不超过其配额限制
 *
 * ## 业务规则
 *
 * ### 配额验证规则
 * - 租户类型决定资源配额
 * - 配额验证在创建资源时进行
 * - 配额验证支持实时检查
 * - 配额验证支持批量检查
 *
 * ### 配额类型规则
 * - 用户数量配额
 * - 存储空间配额
 * - 项目数量配额
 * - 组织数量配额
 *
 * @example
 * ```typescript
 * // 验证租户配额
 * const quotaService = new TenantQuotaValidationService(tenantRepository, logger);
 * 
 * const isValid = await quotaService.validateUserQuota(tenantId, 1);
 * if (!isValid) {
 *   throw new Error('用户数量超出配额限制');
 * }
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";

/**
 * 租户配额信息
 */
export interface TenantQuotaInfo {
  /** 租户ID */
  tenantId: TenantId;
  /** 租户类型 */
  tenantType: TenantType;
  /** 用户数量配额 */
  maxUsers: number;
  /** 当前用户数量 */
  currentUsers: number;
  /** 存储空间配额（GB） */
  maxStorage: number;
  /** 当前存储使用量（GB） */
  currentStorage: number;
  /** 项目数量配额 */
  maxProjects: number;
  /** 当前项目数量 */
  currentProjects: number;
  /** 组织数量配额 */
  maxOrganizations: number;
  /** 当前组织数量 */
  currentOrganizations: number;
}

/**
 * 配额验证结果
 */
export interface QuotaValidationResult {
  /** 是否通过验证 */
  isValid: boolean;
  /** 验证失败的原因 */
  reason?: string;
  /** 当前使用量 */
  currentUsage: number;
  /** 配额限制 */
  quotaLimit: number;
  /** 剩余配额 */
  remainingQuota: number;
}

/**
 * 租户配额验证服务
 *
 * @description 验证租户资源配额，确保租户使用不超过其配额限制
 */
export class TenantQuotaValidationService {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly userRepository: IUserRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly departmentRepository: IDepartmentRepository,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 验证用户数量配额
   *
   * @description 验证租户是否可以创建指定数量的用户
   *
   * @param tenantId - 租户ID
   * @param additionalUsers - 要创建的用户数量
   * @returns Promise<配额验证结果>
   *
   * @example
   * ```typescript
   * const result = await quotaService.validateUserQuota(tenantId, 1);
   * if (!result.isValid) {
   *   throw new Error(result.reason);
   * }
   * ```
   */
  async validateUserQuota(
    tenantId: TenantId,
    additionalUsers: number = 1,
  ): Promise<QuotaValidationResult> {
    try {
      this.logger.debug("验证用户数量配额", {
        tenantId: tenantId.toString(),
        additionalUsers,
      });

      // 获取租户信息
      const tenantAggregate = await this.tenantRepository.findById(tenantId);
      if (!tenantAggregate) {
        throw new Error("租户不存在");
      }

      const tenant = tenantAggregate.getTenant();
      const tenantType = tenant.type;
      const quotaInfo = tenantType.getResourceQuota();

      // 获取当前用户数量
      const currentUsers = await this.userRepository.countByTenant(tenantId);

      // 验证配额
      const totalUsers = currentUsers + additionalUsers;
      const isValid = totalUsers <= quotaInfo.maxUsers;

      const result: QuotaValidationResult = {
        isValid,
        reason: isValid ? undefined : `用户数量超出配额限制。当前: ${currentUsers}, 新增: ${additionalUsers}, 限制: ${quotaInfo.maxUsers}`,
        currentUsage: currentUsers,
        quotaLimit: quotaInfo.maxUsers,
        remainingQuota: quotaInfo.maxUsers - currentUsers,
      };

      this.logger.debug("用户数量配额验证完成", {
        tenantId: tenantId.toString(),
        isValid,
        currentUsers,
        quotaLimit: quotaInfo.maxUsers,
      });

      return result;
    } catch (error) {
      this.logger.error("用户数量配额验证失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        additionalUsers,
      });
      throw error;
    }
  }

  /**
   * 验证组织数量配额
   *
   * @description 验证租户是否可以创建指定数量的组织
   *
   * @param tenantId - 租户ID
   * @param additionalOrganizations - 要创建的组织数量
   * @returns Promise<配额验证结果>
   */
  async validateOrganizationQuota(
    tenantId: TenantId,
    additionalOrganizations: number = 1,
  ): Promise<QuotaValidationResult> {
    try {
      this.logger.debug("验证组织数量配额", {
        tenantId: tenantId.toString(),
        additionalOrganizations,
      });

      // 获取租户信息
      const tenantAggregate = await this.tenantRepository.findById(tenantId);
      if (!tenantAggregate) {
        throw new Error("租户不存在");
      }

      const tenant = tenantAggregate.getTenant();
      const tenantType = tenant.type;
      const quotaInfo = tenantType.getResourceQuota();

      // 获取当前组织数量
      const currentOrganizations = await this.organizationRepository.countByTenant(tenantId);

      // 验证配额
      const totalOrganizations = currentOrganizations + additionalOrganizations;
      const isValid = totalOrganizations <= quotaInfo.maxOrganizations;

      const result: QuotaValidationResult = {
        isValid,
        reason: isValid ? undefined : `组织数量超出配额限制。当前: ${currentOrganizations}, 新增: ${additionalOrganizations}, 限制: ${quotaInfo.maxOrganizations}`,
        currentUsage: currentOrganizations,
        quotaLimit: quotaInfo.maxOrganizations,
        remainingQuota: quotaInfo.maxOrganizations - currentOrganizations,
      };

      this.logger.debug("组织数量配额验证完成", {
        tenantId: tenantId.toString(),
        isValid,
        currentOrganizations,
        quotaLimit: quotaInfo.maxOrganizations,
      });

      return result;
    } catch (error) {
      this.logger.error("组织数量配额验证失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        additionalOrganizations,
      });
      throw error;
    }
  }

  /**
   * 验证存储空间配额
   *
   * @description 验证租户是否可以使用指定数量的存储空间
   *
   * @param tenantId - 租户ID
   * @param additionalStorage - 要使用的存储空间（GB）
   * @returns Promise<配额验证结果>
   */
  async validateStorageQuota(
    tenantId: TenantId,
    additionalStorage: number = 0,
  ): Promise<QuotaValidationResult> {
    try {
      this.logger.debug("验证存储空间配额", {
        tenantId: tenantId.toString(),
        additionalStorage,
      });

      // 获取租户信息
      const tenantAggregate = await this.tenantRepository.findById(tenantId);
      if (!tenantAggregate) {
        throw new Error("租户不存在");
      }

      const tenant = tenantAggregate.getTenant();
      const tenantType = tenant.type;
      const quotaInfo = tenantType.getResourceQuota();

      // 获取当前存储使用量（这里需要根据实际存储系统实现）
      const currentStorage = await this.getCurrentStorageUsage(tenantId);

      // 验证配额
      const totalStorage = currentStorage + additionalStorage;
      const isValid = totalStorage <= quotaInfo.maxStorage;

      const result: QuotaValidationResult = {
        isValid,
        reason: isValid ? undefined : `存储空间超出配额限制。当前: ${currentStorage}GB, 新增: ${additionalStorage}GB, 限制: ${quotaInfo.maxStorage}GB`,
        currentUsage: currentStorage,
        quotaLimit: quotaInfo.maxStorage,
        remainingQuota: quotaInfo.maxStorage - currentStorage,
      };

      this.logger.debug("存储空间配额验证完成", {
        tenantId: tenantId.toString(),
        isValid,
        currentStorage,
        quotaLimit: quotaInfo.maxStorage,
      });

      return result;
    } catch (error) {
      this.logger.error("存储空间配额验证失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        additionalStorage,
      });
      throw error;
    }
  }

  /**
   * 获取租户完整配额信息
   *
   * @description 获取租户的完整配额信息，包括当前使用量和配额限制
   *
   * @param tenantId - 租户ID
   * @returns Promise<租户配额信息>
   *
   * @example
   * ```typescript
   * const quotaInfo = await quotaService.getTenantQuotaInfo(tenantId);
   * console.log(`用户配额: ${quotaInfo.currentUsers}/${quotaInfo.maxUsers}`);
   * ```
   */
  async getTenantQuotaInfo(tenantId: TenantId): Promise<TenantQuotaInfo> {
    try {
      this.logger.debug("获取租户配额信息", {
        tenantId: tenantId.toString(),
      });

      // 获取租户信息
      const tenantAggregate = await this.tenantRepository.findById(tenantId);
      if (!tenantAggregate) {
        throw new Error("租户不存在");
      }

      const tenant = tenantAggregate.getTenant();
      const tenantType = tenant.type;
      const quotaInfo = tenantType.getResourceQuota();

      // 获取当前使用量
      const [currentUsers, currentOrganizations, currentStorage] = await Promise.all([
        this.userRepository.countByTenant(tenantId),
        this.organizationRepository.countByTenant(tenantId),
        this.getCurrentStorageUsage(tenantId),
      ]);

      const result: TenantQuotaInfo = {
        tenantId,
        tenantType,
        maxUsers: quotaInfo.maxUsers,
        currentUsers,
        maxStorage: quotaInfo.maxStorage,
        currentStorage,
        maxProjects: quotaInfo.maxProjects,
        currentProjects: 0, // 这里需要根据实际项目系统实现
        maxOrganizations: quotaInfo.maxOrganizations,
        currentOrganizations,
      };

      this.logger.debug("租户配额信息获取完成", {
        tenantId: tenantId.toString(),
        currentUsers,
        currentOrganizations,
        currentStorage,
      });

      return result;
    } catch (error) {
      this.logger.error("获取租户配额信息失败", {
        error: error.message,
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 获取当前存储使用量
   *
   * @param tenantId - 租户ID
   * @returns Promise<当前存储使用量（GB）>
   * @private
   */
  private async getCurrentStorageUsage(tenantId: TenantId): Promise<number> {
    // 这里需要根据实际存储系统实现
    // 例如：查询文件存储系统、数据库存储等
    // 暂时返回0，实际实现时需要查询存储系统
    return 0;
  }
}
