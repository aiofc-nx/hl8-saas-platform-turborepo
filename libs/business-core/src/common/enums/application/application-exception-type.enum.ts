/**
 * 应用层异常类型枚举
 */
export enum ApplicationExceptionType {
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  AUTHORIZATION = "authorization",
  RESOURCE_NOT_FOUND = "resource_not_found",
  CONCURRENCY = "concurrency",
  EXTERNAL_SERVICE = "external_service",
  CONFIGURATION = "configuration",
  INFRASTRUCTURE = "infrastructure",
}
