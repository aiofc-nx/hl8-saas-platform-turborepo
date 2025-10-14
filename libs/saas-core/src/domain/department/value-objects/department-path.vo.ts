/**
 * 部门路径值对象
 *
 * @description 封装部门路径的验证逻辑和业务规则
 *
 * ## 业务规则
 * - 格式：/root/parent/current
 * - 以 / 开头
 * - 各级部门用 / 分隔
 * - 支持多级嵌套
 *
 * @example
 * ```typescript
 * const path = DepartmentPath.create('/company/tech/backend');
 * console.log(path.getDepth()); // 3
 * console.log(path.getParentPath()); // '/company/tech'
 * ```
 *
 * @class DepartmentPath
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from '@hl8/hybrid-archi';

export class DepartmentPath extends BaseValueObject<string> {
  /**
   * 验证部门路径
   *
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, '部门路径');
    this.validatePattern(
      value,
      /^\/[\w-]+(\/[\w-]+)*$/,
      '部门路径格式不正确，应该是 /root/parent/current 的格式'
    );

    // 检查路径深度
    const depth = this.calculateDepth(value);
    if (depth > 6) {
      throw new Error('部门路径层级不能超过6级');
    }
  }

  /**
   * 计算路径深度
   */
  private calculateDepth(path: string): number {
    return path.split('/').filter((p) => p.length > 0).length;
  }

  /**
   * 创建根路径
   *
   * @param rootName 根路径名称，默认为 'root'
   */
  public static root(rootName: string = 'root'): DepartmentPath {
    return DepartmentPath.create(`/${rootName}`);
  }

  /**
   * 获取路径深度
   */
  public getDepth(): number {
    return this.calculateDepth(this._value);
  }

  /**
   * 检查是否为根路径
   */
  public isRoot(): boolean {
    return this.getDepth() === 1;
  }

  /**
   * 获取父级路径
   */
  public getParentPath(): string | null {
    if (this.isRoot()) {
      return null;
    }
    const parts = this._value.split('/').filter((p) => p.length > 0);
    parts.pop();
    return '/' + parts.join('/');
  }

  /**
   * 获取当前部门名称
   */
  public getCurrentName(): string {
    const parts = this._value.split('/').filter((p) => p.length > 0);
    return parts[parts.length - 1];
  }

  /**
   * 追加子路径
   */
  public appendChild(childName: string): DepartmentPath {
    if (!childName || !/^[\w-]+$/.test(childName)) {
      throw new Error('子部门名称格式不正确');
    }
    return DepartmentPath.create(`${this._value}/${childName}`);
  }

  /**
   * 检查是否为另一个路径的子路径
   */
  public isChildOf(parentPath: DepartmentPath): boolean {
    return this._value.startsWith(parentPath._value + '/');
  }

  /**
   * 检查是否为另一个路径的父路径
   */
  public isParentOf(childPath: DepartmentPath): boolean {
    return childPath.isChildOf(this);
  }

  /**
   * 验证部门路径是否有效
   */
  public static isValid(path: string): boolean {
    try {
      DepartmentPath.create(path);
      return true;
    } catch {
      return false;
    }
  }
}
