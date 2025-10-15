/**
 * 领域服务基础设施导出
 *
 * @description 导出领域服务相关的基础类、接口和工具
 * @since 1.0.0
 */

// 领域服务接口
export type {
  IDomainService,
  IDomainServiceFactory,
  IDomainServiceRegistry,
  IDomainServiceContext,
} from "./domain-service.interface.js";

// 领域服务基类
export { BaseDomainService } from "./domain-service.interface.js";

// 重新导出常用类型
export type { EntityId } from "@hl8/isolation-model";
