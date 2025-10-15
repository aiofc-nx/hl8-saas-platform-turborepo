/**
 * 隔离级别要求装饰器
 *
 * @description 使用元数据标记需要的最低隔离级别
 *
 * ## 使用场景
 *
 * - 需要租户上下文的接口使用 @RequireTenant()
 * - 需要组织上下文的接口使用 @RequireOrganization()
 * - 需要部门上下文的接口使用 @RequireDepartment()
 *
 * @since 1.0.0
 */

import { IsolationLevel } from "@hl8/isolation-model";
import { SetMetadata } from "@nestjs/common";

export const REQUIRED_ISOLATION_LEVEL_KEY = "requiredIsolationLevel";

/**
 * 要求租户级或更高层级的隔离上下文
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   @RequireTenant()
 *   async getUsers() {
 *     // 必须有租户上下文
 *   }
 * }
 * ```
 */
export const RequireTenant = () =>
  SetMetadata(REQUIRED_ISOLATION_LEVEL_KEY, IsolationLevel.TENANT);

/**
 * 要求组织级或更高层级的隔离上下文
 *
 * @example
 * ```typescript
 * @Get('departments')
 * @RequireOrganization()
 * async getDepartments() {
 *   // 必须有组织上下文
 * }
 * ```
 */
export const RequireOrganization = () =>
  SetMetadata(REQUIRED_ISOLATION_LEVEL_KEY, IsolationLevel.ORGANIZATION);

/**
 * 要求部门级隔离上下文
 *
 * @example
 * ```typescript
 * @Get('tasks')
 * @RequireDepartment()
 * async getTasks() {
 *   // 必须有部门上下文
 * }
 * ```
 */
export const RequireDepartment = () =>
  SetMetadata(REQUIRED_ISOLATION_LEVEL_KEY, IsolationLevel.DEPARTMENT);
