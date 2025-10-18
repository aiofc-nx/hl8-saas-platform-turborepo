/**
 * 组织层级验证服务
 *
 * @description 验证组织架构的层级关系，确保组织架构的完整性和正确性
 *
 * ## 业务规则
 *
 * ### 层级验证规则
 * - 组织层级不能超过8层
 * - 部门层级不能超过组织层级
 * - 层级关系必须连续
 * - 层级关系必须正确
 *
 * ### 架构完整性规则
 * - 组织必须有明确的层级结构
 * - 部门必须属于某个组织
 * - 部门层级不能跳跃
 * - 部门层级不能重复
 *
 * @example
 * ```typescript
 * // 验证组织层级
 * const hierarchyService = new OrganizationHierarchyValidationService(organizationRepository, departmentRepository, logger);
 * 
 * const isValid = await hierarchyService.validateOrganizationHierarchy(organizationId);
 * if (!isValid) {
 *   throw new Error('组织层级结构不完整');
 * }
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import { 
  ResourceNotFoundException, 
  BusinessRuleViolationException 
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 组织层级信息
 */
export interface OrganizationHierarchyInfo {
  /** 组织ID */
  organizationId: EntityId;
  /** 组织名称 */
  organizationName: string;
  /** 组织层级 */
  organizationLevel: number;
  /** 部门列表 */
  departments: Array<{
    /** 部门ID */
    departmentId: EntityId;
    /** 部门名称 */
    departmentName: string;
    /** 部门层级 */
    departmentLevel: number;
    /** 父部门ID */
    parentDepartmentId?: EntityId;
    /** 子部门数量 */
    childDepartmentCount: number;
  }>;
  /** 层级统计 */
  levelStatistics: {
    /** 各层级部门数量 */
    levelCounts: Record<number, number>;
    /** 最大层级 */
    maxLevel: number;
    /** 最小层级 */
    minLevel: number;
    /** 层级完整性 */
    isLevelComplete: boolean;
  };
}

/**
 * 层级验证结果
 */
export interface HierarchyValidationResult {
  /** 是否通过验证 */
  isValid: boolean;
  /** 验证失败的原因 */
  reasons: string[];
  /** 层级信息 */
  hierarchyInfo: OrganizationHierarchyInfo;
  /** 建议修复方案 */
  suggestions: string[];
}

/**
 * 组织层级验证服务
 *
 * @description 验证组织架构的层级关系，确保组织架构的完整性和正确性
 */
export class OrganizationHierarchyValidationService {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly departmentRepository: IDepartmentRepository,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 验证组织层级结构
   *
   * @description 验证组织的层级结构是否完整和正确
   *
   * @param organizationId - 组织ID
   * @returns Promise<层级验证结果>
   *
   * @example
   * ```typescript
   * const result = await hierarchyService.validateOrganizationHierarchy(organizationId);
   * if (!result.isValid) {
   *   console.log('验证失败原因:', result.reasons);
   *   console.log('建议修复方案:', result.suggestions);
   * }
   * ```
   */
  async validateOrganizationHierarchy(
    organizationId: EntityId,
  ): Promise<HierarchyValidationResult> {
    try {
      this.logger.debug("验证组织层级结构", {
        organizationId: organizationId.toString(),
      });

      // 获取组织信息
      const organizationAggregate = await this.organizationRepository.findById(organizationId);
      if (!organizationAggregate) {
        throw new ResourceNotFoundException("组织", organizationId.toString());
      }

      const organization = organizationAggregate.getOrganization();
      const organizationName = organization.name;
      const organizationLevel = organization.level?.value || 1;

      // 获取组织下的所有部门
      const departments = await this.departmentRepository.findByOrganization(organizationId);

      // 构建层级信息
      const hierarchyInfo = await this.buildHierarchyInfo(
        organizationId,
        organizationName,
        organizationLevel,
        departments,
      );

      // 验证层级结构
      const validationResult = await this.validateHierarchyStructure(hierarchyInfo);

      this.logger.debug("组织层级结构验证完成", {
        organizationId: organizationId.toString(),
        isValid: validationResult.isValid,
        reasonCount: validationResult.reasons.length,
      });

      return validationResult;
    } catch (error) {
      this.logger.error("组织层级结构验证失败", {
        error: error.message,
        organizationId: organizationId.toString(),
      });
      throw error;
    }
  }

  /**
   * 验证部门层级关系
   *
   * @description 验证部门的层级关系是否正确
   *
   * @param departmentId - 部门ID
   * @returns Promise<层级验证结果>
   */
  async validateDepartmentHierarchy(
    departmentId: EntityId,
  ): Promise<HierarchyValidationResult> {
    try {
      this.logger.debug("验证部门层级关系", {
        departmentId: departmentId.toString(),
      });

      // 获取部门信息
      const departmentAggregate = await this.departmentRepository.findById(departmentId);
      if (!departmentAggregate) {
        throw new ResourceNotFoundException("部门", departmentId.toString());
      }

      const department = departmentAggregate.getDepartment();
      const organizationId = departmentAggregate.organizationId;
      const departmentName = department.name;
      const departmentLevel = department.level.value;

      // 获取组织信息
      const organizationAggregate = await this.organizationRepository.findById(organizationId);
      if (!organizationAggregate) {
        throw new ResourceNotFoundException("组织", organizationId.toString());
      }

      const organization = organizationAggregate.getOrganization();
      const organizationName = organization.name;
      const organizationLevel = organization.level?.value || 1;

      // 构建层级信息
      const hierarchyInfo = await this.buildHierarchyInfo(
        organizationId,
        organizationName,
        organizationLevel,
        [departmentAggregate],
      );

      // 验证层级关系
      const validationResult = await this.validateDepartmentLevelRelation(
        department,
        organization,
        hierarchyInfo,
      );

      this.logger.debug("部门层级关系验证完成", {
        departmentId: departmentId.toString(),
        isValid: validationResult.isValid,
        reasonCount: validationResult.reasons.length,
      });

      return validationResult;
    } catch (error) {
      this.logger.error("部门层级关系验证失败", {
        error: error.message,
        departmentId: departmentId.toString(),
      });
      throw error;
    }
  }

  /**
   * 构建层级信息
   *
   * @param organizationId - 组织ID
   * @param organizationName - 组织名称
   * @param organizationLevel - 组织层级
   * @param departments - 部门列表
   * @returns Promise<组织层级信息>
   * @private
   */
  private async buildHierarchyInfo(
    organizationId: EntityId,
    organizationName: string,
    organizationLevel: number,
    departments: any[],
  ): Promise<OrganizationHierarchyInfo> {
    // 构建部门信息
    const departmentInfos = departments.map(departmentAggregate => {
      const department = departmentAggregate.getDepartment();
      return {
        departmentId: departmentAggregate.id,
        departmentName: department.name,
        departmentLevel: department.level.value,
        parentDepartmentId: department.parentDepartmentId,
        childDepartmentCount: 0, // 这里需要根据实际关系计算
      };
    });

    // 计算层级统计
    const levelCounts: Record<number, number> = {};
    let maxLevel = 0;
    let minLevel = 8;

    for (const dept of departmentInfos) {
      const level = dept.departmentLevel;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
      maxLevel = Math.max(maxLevel, level);
      minLevel = Math.min(minLevel, level);
    }

    // 检查层级完整性
    const isLevelComplete = this.checkLevelCompleteness(levelCounts, minLevel, maxLevel);

    return {
      organizationId,
      organizationName,
      organizationLevel,
      departments: departmentInfos,
      levelStatistics: {
        levelCounts,
        maxLevel,
        minLevel,
        isLevelComplete,
      },
    };
  }

  /**
   * 验证层级结构
   *
   * @param hierarchyInfo - 层级信息
   * @returns Promise<层级验证结果>
   * @private
   */
  private async validateHierarchyStructure(
    hierarchyInfo: OrganizationHierarchyInfo,
  ): Promise<HierarchyValidationResult> {
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 验证层级深度
    if (hierarchyInfo.levelStatistics.maxLevel > 8) {
      reasons.push("部门层级超过8层限制");
      suggestions.push("请重新设计组织架构，减少层级深度");
    }

    // 验证层级完整性
    if (!hierarchyInfo.levelStatistics.isLevelComplete) {
      reasons.push("部门层级结构不完整");
      suggestions.push("请检查部门层级关系，确保层级连续");
    }

    // 验证部门层级不能超过组织层级
    for (const dept of hierarchyInfo.departments) {
      if (dept.departmentLevel > hierarchyInfo.organizationLevel) {
        reasons.push(`部门 ${dept.departmentName} 的层级超过组织层级`);
        suggestions.push("请调整部门层级或组织层级");
      }
    }

    // 验证父部门关系
    for (const dept of hierarchyInfo.departments) {
      if (dept.parentDepartmentId) {
        const parentDept = hierarchyInfo.departments.find(d => d.departmentId.equals(dept.parentDepartmentId));
        if (parentDept && parentDept.departmentLevel >= dept.departmentLevel) {
          reasons.push(`部门 ${dept.departmentName} 的父部门层级不正确`);
          suggestions.push("请检查部门层级关系");
        }
      }
    }

    return {
      isValid: reasons.length === 0,
      reasons,
      hierarchyInfo,
      suggestions,
    };
  }

  /**
   * 验证部门层级关系
   *
   * @param department - 部门
   * @param organization - 组织
   * @param hierarchyInfo - 层级信息
   * @returns Promise<层级验证结果>
   * @private
   */
  private async validateDepartmentLevelRelation(
    department: any,
    organization: any,
    hierarchyInfo: OrganizationHierarchyInfo,
  ): Promise<HierarchyValidationResult> {
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 验证部门层级不能超过组织层级
    if (department.level.value > organization.level?.value) {
      reasons.push("部门层级不能超过组织层级");
      suggestions.push("请调整部门层级或组织层级");
    }

    // 验证部门层级必须在有效范围内
    if (department.level.value < 1 || department.level.value > 8) {
      reasons.push("部门层级必须在1-8之间");
      suggestions.push("请设置正确的部门层级");
    }

    return {
      isValid: reasons.length === 0,
      reasons,
      hierarchyInfo,
      suggestions,
    };
  }

  /**
   * 检查层级完整性
   *
   * @param levelCounts - 层级统计
   * @param minLevel - 最小层级
   * @param maxLevel - 最大层级
   * @returns 是否完整
   * @private
   */
  private checkLevelCompleteness(
    levelCounts: Record<number, number>,
    minLevel: number,
    maxLevel: number,
  ): boolean {
    // 检查层级是否连续
    for (let level = minLevel; level <= maxLevel; level++) {
      if (!levelCounts[level] || levelCounts[level] === 0) {
        return false;
      }
    }
    return true;
  }
}
