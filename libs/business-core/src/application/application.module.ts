/**
 * 应用层模块
 *
 * @description 配置应用层的所有组件，包括用例服务、应用服务、CQRS组件等
 *
 * ## 业务规则
 *
 * ### 模块配置规则
 * - 所有应用层组件都应该通过依赖注入配置
 * - 模块应该提供清晰的组件边界
 * - 模块应该支持测试时的模拟替换
 * - 模块应该支持环境特定的配置
 *
 * ### 依赖注入规则
 * - 使用接口类型进行依赖注入，确保松耦合
 * - 所有依赖都应该是可选的，支持部分功能
 * - 依赖注入应该支持测试时的模拟替换
 * - 依赖注入应该支持环境特定的实现
 *
 * ### 组件组织规则
 * - 用例服务集合：统一管理相关用例
 * - 应用服务：协调多个用例服务
 * - CQRS组件：命令和查询处理器
 * - 事件处理器：处理领域事件
 * - 基础设施服务：事件总线、事务管理器、缓存服务
 *
 * @example
 * ```typescript
 * // 在应用中使用
 * @Module({
 *   imports: [ApplicationModule],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 *
 * @since 1.0.0
 */

import { Module } from "@nestjs/common";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 用例服务
import { CreateUserUseCase } from "./use-cases/user/create-user.use-case.js";
import { UpdateUserUseCase } from "./use-cases/user/update-user.use-case.js";
import { DeleteUserUseCase } from "./use-cases/user/delete-user.use-case.js";
import { GetUserUseCase } from "./use-cases/user/get-user.use-case.js";
import { GetUserListUseCase } from "./use-cases/user/get-user-list.use-case.js";
import { ActivateUserUseCase } from "./use-cases/user/activate-user.use-case.js";
import { DeactivateUserUseCase } from "./use-cases/user/deactivate-user.use-case.js";

import { CreateTenantUseCase } from "./use-cases/tenant/create-tenant.use-case.js";
import { UpdateTenantUseCase } from "./use-cases/tenant/update-tenant.use-case.js";
import { GetTenantsUseCase } from "./use-cases/tenant/get-tenants.use-case.js";

// 用例服务集合
import { UserUseCaseServices } from "./services/user-use-case-services.js";
import { TenantUseCaseServices } from "./services/tenant-use-case-services.js";
import { OrganizationUseCaseServices } from "./services/organization-use-case-services.js";

// 应用服务
import { UserApplicationService } from "./services/user-application.service.js";
import { TenantApplicationService } from "./services/tenant-application.service.js";

// 基础设施服务
import { EventBus } from "./ports/event-bus.js";
import { TransactionManager } from "./ports/transaction-manager.js";
import { CacheService } from "./ports/cache-service.js";

// 仓储接口（需要根据实际实现进行调整）
import type { IUserRepository } from "../domain/repositories/user.repository.js";
import type { ITenantRepository } from "../domain/repositories/tenant.repository.js";
import type { IOrganizationRepository } from "../domain/repositories/organization.repository.js";

/**
 * 应用层模块
 *
 * @description 配置应用层的所有组件，包括用例服务、应用服务、CQRS组件等
 *
 * ## 业务规则
 *
 * ### 模块配置规则
 * - 所有应用层组件都应该通过依赖注入配置
 * - 模块应该提供清晰的组件边界
 * - 模块应该支持测试时的模拟替换
 * - 模块应该支持环境特定的配置
 *
 * ### 依赖注入规则
 * - 使用接口类型进行依赖注入，确保松耦合
 * - 所有依赖都应该是可选的，支持部分功能
 * - 依赖注入应该支持测试时的模拟替换
 * - 依赖注入应该支持环境特定的实现
 *
 * ### 组件组织规则
 * - 用例服务集合：统一管理相关用例
 * - 应用服务：协调多个用例服务
 * - CQRS组件：命令和查询处理器
 * - 事件处理器：处理领域事件
 * - 基础设施服务：事件总线、事务管理器、缓存服务
 *
 * @example
 * ```typescript
 * // 在应用中使用
 * @Module({
 *   imports: [ApplicationModule],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 *
 * @since 1.0.0
 */
@Module({
  providers: [
    // 基础设施服务
    {
      provide: "IEventBus",
      useFactory: (logger: FastifyLoggerService) => new EventBus(logger),
      inject: [FastifyLoggerService],
    },
    {
      provide: "ITransactionManager",
      useFactory: (logger: FastifyLoggerService) => new TransactionManager(logger),
      inject: [FastifyLoggerService],
    },
    {
      provide: "ICacheService",
      useFactory: (logger: FastifyLoggerService) => new CacheService(logger),
      inject: [FastifyLoggerService],
    },

    // 用例服务
    {
      provide: "ICreateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new CreateUserUseCase(
          userRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "IUserRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IUpdateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new UpdateUserUseCase(
          userRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "IUserRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IDeleteUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new DeleteUserUseCase(
          userRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "IUserRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IGetUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetUserUseCase(userRepository, cacheService, logger),
      inject: ["IUserRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IGetUserListUseCase",
      useFactory: (
        userRepository: IUserRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetUserListUseCase(userRepository, cacheService, logger),
      inject: ["IUserRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IActivateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new ActivateUserUseCase(
          userRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "IUserRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IDeactivateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new DeactivateUserUseCase(
          userRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "IUserRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },

    // 租户用例服务
    {
      provide: "ICreateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new CreateTenantUseCase(
          tenantRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "ITenantRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IUpdateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) =>
        new UpdateTenantUseCase(
          tenantRepository,
          eventBus,
          transactionManager,
          logger,
        ),
      inject: [
        "ITenantRepository",
        "IEventBus",
        "ITransactionManager",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IGetTenantsUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetTenantsUseCase(tenantRepository, cacheService, logger),
      inject: ["ITenantRepository", "ICacheService", FastifyLoggerService],
    },

    // 用例服务集合
    {
      provide: "IUserUseCaseServices",
      useFactory: (
        createUserUseCase: any,
        updateUserUseCase: any,
        deleteUserUseCase: any,
        getUserUseCase: any,
        getUserListUseCase: any,
        activateUserUseCase: any,
        deactivateUserUseCase: any,
        logger: FastifyLoggerService,
      ) =>
        new UserUseCaseServices(
          createUserUseCase,
          updateUserUseCase,
          deleteUserUseCase,
          getUserUseCase,
          getUserListUseCase,
          activateUserUseCase,
          deactivateUserUseCase,
          logger,
        ),
      inject: [
        "ICreateUserUseCase",
        "IUpdateUserUseCase",
        "IDeleteUserUseCase",
        "IGetUserUseCase",
        "IGetUserListUseCase",
        "IActivateUserUseCase",
        "IDeactivateUserUseCase",
        FastifyLoggerService,
      ],
    },
    {
      provide: "ITenantUseCaseServices",
      useFactory: (
        createTenantUseCase: any,
        updateTenantUseCase: any,
        getTenantsUseCase: any,
        logger: FastifyLoggerService,
      ) =>
        new TenantUseCaseServices(
          createTenantUseCase,
          updateTenantUseCase,
          getTenantsUseCase,
          logger,
        ),
      inject: [
        "ICreateTenantUseCase",
        "IUpdateTenantUseCase",
        "IGetTenantsUseCase",
        FastifyLoggerService,
      ],
    },
    {
      provide: "IOrganizationUseCaseServices",
      useFactory: (logger: FastifyLoggerService) => new OrganizationUseCaseServices(logger),
      inject: [FastifyLoggerService],
    },

    // 应用服务
    {
      provide: "IUserApplicationService",
      useFactory: (
        userUseCaseServices: any,
        logger: FastifyLoggerService,
      ) => new UserApplicationService(userUseCaseServices, logger),
      inject: ["IUserUseCaseServices", FastifyLoggerService],
    },
    {
      provide: "ITenantApplicationService",
      useFactory: (
        tenantUseCaseServices: any,
        logger: FastifyLoggerService,
      ) => new TenantApplicationService(tenantUseCaseServices, logger),
      inject: ["ITenantUseCaseServices", FastifyLoggerService],
    },
  ],
  exports: [
    // 基础设施服务
    "IEventBus",
    "ITransactionManager",
    "ICacheService",

    // 用例服务
    "ICreateUserUseCase",
    "IUpdateUserUseCase",
    "IDeleteUserUseCase",
    "IGetUserUseCase",
    "IGetUserListUseCase",
    "IActivateUserUseCase",
    "IDeactivateUserUseCase",

    "ICreateTenantUseCase",
    "IUpdateTenantUseCase",
    "IGetTenantsUseCase",

    // 用例服务集合
    "IUserUseCaseServices",
    "ITenantUseCaseServices",
    "IOrganizationUseCaseServices",

    // 应用服务
    "IUserApplicationService",
    "ITenantApplicationService",
  ],
})
export class ApplicationModule {}