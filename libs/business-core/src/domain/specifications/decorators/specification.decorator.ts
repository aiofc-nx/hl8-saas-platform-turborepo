/**
 * 规范装饰器
 *
 * @description 提供规范模式的装饰器支持，用于简化规范的使用
 * @since 1.0.0
 */

import { ISpecification } from '../base/specification.interface.js';

/**
 * 规范装饰器
 *
 * @description 将方法标记为规范，自动处理规范的注册和管理
 * @param metadata - 规范元数据
 */
export function Specification<T>(
  metadata: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    priority?: number;
    enabled?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    // 创建规范元数据
    const specMetadata = {
      name: metadata.name || propertyKey,
      description: metadata.description || `${propertyKey} 规范`,
      category: metadata.category || 'default',
      tags: metadata.tags || [],
      priority: metadata.priority || 0,
      enabled: metadata.enabled !== false,
    };

    // 重写方法以支持规范功能
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      // 如果返回的是布尔值，包装为规范结果
      if (typeof result === 'boolean') {
        return {
          isSatisfied: result,
          errorMessage: result ? undefined : `${specMetadata.name} 规范不满足`,
          context: {
            specification: specMetadata.name,
            method: propertyKey,
            args: args,
          },
          specificationName: specMetadata.name,
          specificationDescription: specMetadata.description,
        };
      }
      
      return result;
    };

    // 添加规范元数据到方法
    descriptor.value.metadata = specMetadata;
    descriptor.value.isSpecification = true;
    
    return descriptor;
  };
}

/**
 * 业务规则装饰器
 *
 * @description 将方法标记为业务规则规范
 * @param metadata - 规范元数据
 */
export function BusinessRule<T>(
  metadata: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    priority?: number;
    enabled?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    // 创建业务规则元数据
    const ruleMetadata = {
      name: metadata.name || propertyKey,
      description: metadata.description || `${propertyKey} 业务规则`,
      category: metadata.category || 'business-rule',
      tags: [...(metadata.tags || []), 'business-rule'],
      priority: metadata.priority || 1,
      enabled: metadata.enabled !== false,
    };

    // 重写方法以支持业务规则功能
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      // 如果返回的是布尔值，包装为规范结果
      if (typeof result === 'boolean') {
        return {
          isSatisfied: result,
          errorMessage: result ? undefined : `${ruleMetadata.name} 业务规则不满足`,
          context: {
            specification: ruleMetadata.name,
            method: propertyKey,
            args: args,
            type: 'business-rule',
          },
          specificationName: ruleMetadata.name,
          specificationDescription: ruleMetadata.description,
        };
      }
      
      return result;
    };

    // 添加业务规则元数据到方法
    descriptor.value.metadata = ruleMetadata;
    descriptor.value.isSpecification = true;
    descriptor.value.isBusinessRule = true;
    
    return descriptor;
  };
}

/**
 * 验证装饰器
 *
 * @description 将方法标记为验证规范
 * @param metadata - 规范元数据
 */
export function Validation<T>(
  metadata: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    priority?: number;
    enabled?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    // 创建验证元数据
    const validationMetadata = {
      name: metadata.name || propertyKey,
      description: metadata.description || `${propertyKey} 验证`,
      category: metadata.category || 'validation',
      tags: [...(metadata.tags || []), 'validation'],
      priority: metadata.priority || 2,
      enabled: metadata.enabled !== false,
    };

    // 重写方法以支持验证功能
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      // 如果返回的是布尔值，包装为规范结果
      if (typeof result === 'boolean') {
        return {
          isSatisfied: result,
          errorMessage: result ? undefined : `${validationMetadata.name} 验证失败`,
          context: {
            specification: validationMetadata.name,
            method: propertyKey,
            args: args,
            type: 'validation',
          },
          specificationName: validationMetadata.name,
          specificationDescription: validationMetadata.description,
        };
      }
      
      return result;
    };

    // 添加验证元数据到方法
    descriptor.value.metadata = validationMetadata;
    descriptor.value.isSpecification = true;
    descriptor.value.isValidation = true;
    
    return descriptor;
  };
}

/**
 * 组合规范装饰器
 *
 * @description 将多个规范组合成一个规范
 * @param specifications - 规范列表
 * @param operator - 组合操作符 ('and' | 'or')
 */
export function CompositeSpecification<T>(
  specifications: ISpecification<T>[],
  operator: 'and' | 'or' = 'and',
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    // 重写方法以支持组合规范功能
    descriptor.value = function (...args: any[]) {
      const results = specifications.map(spec => spec.isSatisfiedBy(args[0]));
      
      let isSatisfied: boolean;
      if (operator === 'and') {
        isSatisfied = results.every(result => result);
      } else {
        isSatisfied = results.some(result => result);
      }
      
      return {
        isSatisfied,
        errorMessage: isSatisfied ? undefined : `组合规范 (${operator}) 不满足`,
        context: {
          specifications: specifications.map(spec => spec.getName()),
          operator,
          results,
          method: propertyKey,
          args: args,
        },
        specificationName: `CompositeSpecification_${operator}`,
        specificationDescription: `组合规范 (${operator})`,
      };
    };

    // 添加组合规范元数据到方法
    descriptor.value.metadata = {
      name: `CompositeSpecification_${operator}`,
      description: `组合规范 (${operator})`,
      category: 'composite',
      tags: ['composite', operator],
      priority: 0,
      enabled: true,
    };
    descriptor.value.isSpecification = true;
    descriptor.value.isComposite = true;
    
    return descriptor;
  };
}

/**
 * 条件规范装饰器
 *
 * @description 根据条件决定是否应用规范
 * @param condition - 条件函数
 * @param specification - 规范
 */
export function ConditionalSpecification<T>(
  condition: (candidate: T) => boolean,
  specification: ISpecification<T>,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    // 重写方法以支持条件规范功能
    descriptor.value = function (...args: any[]) {
      const candidate = args[0];
      
      if (!condition(candidate)) {
        return {
          isSatisfied: true,
          errorMessage: undefined,
          context: {
            specification: specification.getName(),
            method: propertyKey,
            args: args,
            skipped: true,
          },
          specificationName: `ConditionalSpecification_${specification.getName()}`,
          specificationDescription: `条件规范: ${specification.getDescription()}`,
        };
      }
      
      const isSatisfied = specification.isSatisfiedBy(candidate);
      return {
        isSatisfied,
        errorMessage: isSatisfied ? undefined : `${specification.getName()} 条件规范不满足`,
        context: {
          specification: specification.getName(),
          method: propertyKey,
          args: args,
          condition: condition.toString(),
        },
        specificationName: `ConditionalSpecification_${specification.getName()}`,
        specificationDescription: `条件规范: ${specification.getDescription()}`,
      };
    };

    // 添加条件规范元数据到方法
    descriptor.value.metadata = {
      name: `ConditionalSpecification_${specification.getName()}`,
      description: `条件规范: ${specification.getDescription()}`,
      category: 'conditional',
      tags: ['conditional', 'specification'],
      priority: 0,
      enabled: true,
    };
    descriptor.value.isSpecification = true;
    descriptor.value.isConditional = true;
    
    return descriptor;
  };
}
