/**
 * 共享类型定义
 *
 * @description 提供通用的 TypeScript 类型工具
 *
 * @since 0.1.0
 * @packageDocumentation
 */

/**
 * DeepPartial 类型
 *
 * @description 将类型的所有属性（包括嵌套属性）变为可选
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   profile: {
 *     name: string;
 *     age: number;
 *   };
 * }
 *
 * type PartialUser = DeepPartial<User>;
 * // {
 * //   id?: string;
 * //   profile?: {
 * //     name?: string;
 * //     age?: number;
 * //   };
 * // }
 * ```
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * DeepReadonly 类型
 *
 * @description 将类型的所有属性（包括嵌套属性）变为只读
 *
 * @example
 * ```typescript
 * interface Config {
 *   db: {
 *     host: string;
 *     port: number;
 *   };
 * }
 *
 * type ReadonlyConfig = DeepReadonly<Config>;
 * // {
 * //   readonly db: {
 * //     readonly host: string;
 * //     readonly port: number;
 * //   };
 * // }
 * ```
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Nullable 类型
 *
 * @description 将类型变为可空（可以是 null）
 *
 * @example
 * ```typescript
 * type NullableString = Nullable<string>;
 * // string | null
 * ```
 */
export type Nullable<T> = T | null;

/**
 * Optional 类型
 *
 * @description 将类型变为可选（可以是 undefined）
 *
 * @example
 * ```typescript
 * type OptionalString = Optional<string>;
 * // string | undefined
 * ```
 */
export type Optional<T> = T | undefined;

/**
 * Constructor 类型
 *
 * @description 表示一个可实例化的类型
 *
 * @example
 * ```typescript
 * function createInstance<T>(ctor: Constructor<T>): T {
 *   return new ctor();
 * }
 * ```
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * AbstractConstructor 类型
 *
 * @description 表示一个抽象类类型
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

/**
 * AnyFunction 类型
 *
 * @description 表示任意函数类型
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * AsyncFunction 类型
 *
 * @description 表示异步函数类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * ValueOf 类型
 *
 * @description 获取对象类型的值类型
 *
 * @example
 * ```typescript
 * const Status = {
 *   ACTIVE: 'active',
 *   INACTIVE: 'inactive',
 * } as const;
 *
 * type StatusValue = ValueOf<typeof Status>;
 * // 'active' | 'inactive'
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Mutable 类型
 *
 * @description 移除类型的 readonly 修饰符
 *
 * @example
 * ```typescript
 * interface ReadonlyUser {
 *   readonly id: string;
 *   readonly name: string;
 * }
 *
 * type MutableUser = Mutable<ReadonlyUser>;
 * // {
 * //   id: string;
 * //   name: string;
 * // }
 * ```
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * RequiredKeys 类型
 *
 * @description 提取类型中的必需属性键
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age?: number;
 * }
 *
 * type UserRequiredKeys = RequiredKeys<User>;
 * // 'id' | 'name'
 * ```
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * OptionalKeys 类型
 *
 * @description 提取类型中的可选属性键
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age?: number;
 * }
 *
 * type UserOptionalKeys = OptionalKeys<User>;
 * // 'age'
 * ```
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

