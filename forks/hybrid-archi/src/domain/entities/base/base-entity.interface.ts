/**
 * 最基础的空接口，提供最小的类型约束，用于泛型约束
 *
 * @description 所有的实体都必须实现这个空接口，用于泛型约束，避免使用any
 * @since 1.0.0
 */
export interface IBaseEntity {
  // 标记接口，用于类型约束
  readonly _marker?: never;
}
