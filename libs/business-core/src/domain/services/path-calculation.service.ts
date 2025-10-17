import { EntityId } from "@hl8/isolation-model";
import type { IPureLogger } from "@hl8/pure-logger";

/**
 * 路径计算服务
 *
 * @description 负责计算部门和组织的层级路径，支持路径的创建、更新和验证。
 * 路径用于快速查询层级关系，提高查询性能。
 *
 * ## 业务规则
 *
 * ### 路径格式规则
 * - 路径格式：/parentId1/parentId2/currentId
 * - 根节点路径：/currentId
 * - 路径分隔符：/
 * - 路径不能为空
 * - 路径不能包含循环引用
 *
 * ### 路径计算规则
 * - 根节点：路径为 /currentId
 * - 子节点：路径为 /parentPath/currentId
 * - 路径更新：当父节点变更时，需要更新所有子节点的路径
 * - 路径验证：确保路径不包含循环引用
 *
 * @example
 * ```typescript
 * // 创建路径计算服务
 * const pathService = new PathCalculationService(logger);
 *
 * // 计算新部门的路径
 * const path = pathService.calculateDepartmentPath(
 *   departmentId,
 *   parentDepartmentId,
 *   parentPath
 * );
 *
 * // 验证路径
 * const isValid = pathService.validatePath(path);
 * ```
 *
 * @since 1.0.0
 */
export class PathCalculationService {
  private readonly logger: IPureLogger;

  /**
   * 构造函数
   *
   * @param logger - 日志记录器
   */
  constructor(logger: IPureLogger) {
    this.logger = logger;
  }

  /**
   * 计算部门路径
   *
   * @description 根据父部门路径和当前部门ID计算部门路径
   *
   * @param departmentId - 部门ID
   * @param parentId - 父部门ID（可选）
   * @param parentPath - 父部门路径（可选）
   * @returns 计算出的部门路径
   *
   * @throws {Error} 当部门ID为空时
   * @throws {Error} 当路径计算失败时
   *
   * @example
   * ```typescript
   * const path = pathService.calculateDepartmentPath(
   *   departmentId,
   *   parentDepartmentId,
   *   "/org1/dept1"
   * );
   * // 结果: "/org1/dept1/newDeptId"
   * ```
   */
  calculateDepartmentPath(
    departmentId: EntityId,
    parentId?: EntityId,
    parentPath?: string,
  ): string {
    try {
      this.validateDepartmentId(departmentId);

      // 如果没有父部门，则为根部门
      if (!parentId || !parentPath) {
        const rootPath = `/${departmentId.toString()}`;
        this.logger.debug("计算根部门路径", {
          departmentId: departmentId.toString(),
          path: rootPath,
        });
        return rootPath;
      }

      // 验证父部门路径
      this.validateParentPath(parentPath);

      // 计算子部门路径
      const childPath = `${parentPath}/${departmentId.toString()}`;

      // 验证路径不包含循环引用
      this.validateNoCircularReference(childPath, departmentId);

      this.logger.debug("计算部门路径", {
        departmentId: departmentId.toString(),
        parentId: parentId.toString(),
        parentPath,
        childPath,
      });

      return childPath;
    } catch (error) {
      this.logger.error("计算部门路径失败", error);
      throw new Error(`计算部门路径失败: ${error.message}`);
    }
  }

  /**
   * 计算组织路径
   *
   * @description 根据父组织路径和当前组织ID计算组织路径
   *
   * @param organizationId - 组织ID
   * @param parentId - 父组织ID（可选）
   * @param parentPath - 父组织路径（可选）
   * @returns 计算出的组织路径
   *
   * @throws {Error} 当组织ID为空时
   * @throws {Error} 当路径计算失败时
   *
   * @example
   * ```typescript
   * const path = pathService.calculateOrganizationPath(
   *   organizationId,
   *   parentOrganizationId,
   *   "/tenant1/org1"
   * );
   * // 结果: "/tenant1/org1/newOrgId"
   * ```
   */
  calculateOrganizationPath(
    organizationId: EntityId,
    parentId?: EntityId,
    parentPath?: string,
  ): string {
    try {
      this.validateOrganizationId(organizationId);

      // 如果没有父组织，则为根组织
      if (!parentId || !parentPath) {
        const rootPath = `/${organizationId.toString()}`;
        this.logger.debug("计算根组织路径", {
          organizationId: organizationId.toString(),
          path: rootPath,
        });
        return rootPath;
      }

      // 验证父组织路径
      this.validateParentPath(parentPath);

      // 计算子组织路径
      const childPath = `${parentPath}/${organizationId.toString()}`;

      // 验证路径不包含循环引用
      this.validateNoCircularReference(childPath, organizationId);

      this.logger.debug("计算组织路径", {
        organizationId: organizationId.toString(),
        parentId: parentId.toString(),
        parentPath,
        childPath,
      });

      return childPath;
    } catch (error) {
      this.logger.error("计算组织路径失败", error);
      throw new Error(`计算组织路径失败: ${error.message}`);
    }
  }

  /**
   * 更新子节点路径
   *
   * @description 当父节点路径变更时，更新所有子节点的路径
   *
   * @param oldParentPath - 旧的父节点路径
   * @param newParentPath - 新的父节点路径
   * @param childPaths - 需要更新的子节点路径列表
   * @returns 更新后的子节点路径列表
   *
   * @throws {Error} 当路径更新失败时
   *
   * @example
   * ```typescript
   * const updatedPaths = pathService.updateChildPaths(
   *   "/old/parent/path",
   *   "/new/parent/path",
   *   ["/old/parent/path/child1", "/old/parent/path/child2"]
   * );
   * // 结果: ["/new/parent/path/child1", "/new/parent/path/child2"]
   * ```
   */
  updateChildPaths(
    oldParentPath: string,
    newParentPath: string,
    childPaths: string[],
  ): string[] {
    try {
      this.validateParentPath(oldParentPath);
      this.validateParentPath(newParentPath);

      const updatedPaths: string[] = [];

      for (const childPath of childPaths) {
        if (childPath.startsWith(oldParentPath)) {
          // 替换父路径部分
          const childSuffix = childPath.substring(oldParentPath.length);
          const newChildPath = `${newParentPath}${childSuffix}`;
          updatedPaths.push(newChildPath);
        } else {
          // 保持原路径不变
          updatedPaths.push(childPath);
        }
      }

      this.logger.debug("更新子节点路径", {
        oldParentPath,
        newParentPath,
        childPathsCount: childPaths.length,
        updatedPathsCount: updatedPaths.length,
      });

      return updatedPaths;
    } catch (error) {
      this.logger.error("更新子节点路径失败", error);
      throw new Error(`更新子节点路径失败: ${error.message}`);
    }
  }

  /**
   * 验证路径格式
   *
   * @description 验证路径是否符合格式要求
   *
   * @param path - 要验证的路径
   * @returns 是否有效
   *
   * @example
   * ```typescript
   * const isValid = pathService.validatePath("/org1/dept1");
   * ```
   */
  validatePath(path: string): boolean {
    try {
      if (!path || typeof path !== "string") {
        return false;
      }

      // 路径必须以 / 开头
      if (!path.startsWith("/")) {
        return false;
      }

      // 路径不能以 / 结尾（除非是根路径）
      if (path.length > 1 && path.endsWith("/")) {
        return false;
      }

      // 路径不能包含连续的 /
      if (path.includes("//")) {
        return false;
      }

      // 路径不能包含空格
      if (path.includes(" ")) {
        return false;
      }

      // 路径不能包含特殊字符
      if (!/^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/.test(path)) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error("验证路径格式失败", error);
      return false;
    }
  }

  /**
   * 获取路径深度
   *
   * @description 计算路径的层级深度
   *
   * @param path - 路径
   * @returns 路径深度
   *
   * @example
   * ```typescript
   * const depth = pathService.getPathDepth("/org1/dept1/subdept1");
   * // 结果: 3
   * ```
   */
  getPathDepth(path: string): number {
    if (!this.validatePath(path)) {
      return 0;
    }

    // 根路径深度为1
    if (path === "/") {
      return 1;
    }

    // 计算路径中的分隔符数量
    const depth = path.split("/").length - 1;
    return Math.max(1, depth);
  }

  /**
   * 获取路径的父路径
   *
   * @description 获取指定路径的父路径
   *
   * @param path - 当前路径
   * @returns 父路径，如果是根路径则返回null
   *
   * @example
   * ```typescript
   * const parentPath = pathService.getParentPath("/org1/dept1/subdept1");
   * // 结果: "/org1/dept1"
   * ```
   */
  getParentPath(path: string): string | null {
    if (!this.validatePath(path)) {
      return null;
    }

    // 根路径没有父路径
    if (path === "/" || path.split("/").length <= 2) {
      return null;
    }

    // 获取父路径
    const lastSlashIndex = path.lastIndexOf("/");
    if (lastSlashIndex <= 0) {
      return null;
    }

    return path.substring(0, lastSlashIndex);
  }

  /**
   * 验证部门ID
   *
   * @private
   */
  private validateDepartmentId(departmentId: EntityId): void {
    if (!departmentId) {
      throw new Error("部门ID不能为空");
    }
  }

  /**
   * 验证组织ID
   *
   * @private
   */
  private validateOrganizationId(organizationId: EntityId): void {
    if (!organizationId) {
      throw new Error("组织ID不能为空");
    }
  }

  /**
   * 验证父路径
   *
   * @private
   */
  private validateParentPath(parentPath: string): void {
    if (!parentPath || typeof parentPath !== "string") {
      throw new Error("父路径不能为空");
    }

    if (!this.validatePath(parentPath)) {
      throw new Error("父路径格式无效");
    }
  }

  /**
   * 验证路径不包含循环引用
   *
   * @private
   */
  private validateNoCircularReference(path: string, currentId: EntityId): void {
    const pathSegments = path.split("/").filter(segment => segment.length > 0);
    const currentIdString = currentId.toString();

    // 检查当前ID是否在路径中出现多次
    const occurrences = pathSegments.filter(segment => segment === currentIdString);
    if (occurrences.length > 1) {
      throw new Error("路径包含循环引用");
    }

    // 检查路径中是否有重复的ID
    const uniqueSegments = new Set(pathSegments);
    if (pathSegments.length !== uniqueSegments.size) {
      throw new Error("路径包含重复的ID");
    }
  }
}
