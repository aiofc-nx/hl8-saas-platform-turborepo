/**
 * 核心模块导出 - 从 @hl8/nestjs-infra 复用
 *
 * @description 重新导出可复用的核心模块
 */

// 复用 Caching Module
export {
  CachingModule,
  CacheService,
  RedisService,
  CachingModuleConfig,
  RedisConfig,
  Cacheable,
  CacheEvict,
  CachePut,
} from '@hl8/nestjs-infra';

// 复用 Isolation Module
export {
  IsolationModule,
  IsolationContextService,
  MultiLevelIsolationService,
  CurrentIsolation,
  IsolationContext,
  IsolationLevel,
  DataSharingLevel,
} from '@hl8/nestjs-infra';

// 复用 Configuration Module
export {
  TypedConfigModule,
  ConfigValidator,
  ConfigCacheService,
  FileLoader,
  DotenvLoader,
  RemoteLoader,
} from '@hl8/nestjs-infra';

// 复用 Shared
export {
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
  TenantNotFoundException,
  InvalidIsolationContextException,
  UnauthorizedOrganizationException,
  GeneralNotFoundException,
  GeneralBadRequestException,
  GeneralInternalServerException,
  AbstractHttpException,
} from '@hl8/nestjs-infra';

