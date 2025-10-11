/**
 * ConfigValidator 单元测试
 */

import { ConfigValidator } from './config.validator.js';
import { GeneralBadRequestException } from '../../exceptions/core/general-bad-request.exception.js';
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

// 测试用配置类
class TestConfig {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  age!: number;

  @IsString()
  @IsOptional()
  email?: string;
}

describe('ConfigValidator', () => {
  describe('validate', () => {
    it('应该验证通过有效的配置', () => {
      const config = {
        name: 'Test',
        age: 25,
        email: 'test@example.com',
      };

      const result = ConfigValidator.validate(TestConfig, config);

      expect(result).toBeInstanceOf(TestConfig);
      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
      expect(result.email).toBe('test@example.com');
    });

    it('可选字段缺失时应该验证通过', () => {
      const config = {
        name: 'Test',
        age: 25,
      };

      const result = ConfigValidator.validate(TestConfig, config);

      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
      expect(result.email).toBeUndefined();
    });

    it('必需字段缺失时应该抛出异常', () => {
      const config = {
        age: 25,
      };

      expect(() => ConfigValidator.validate(TestConfig, config)).toThrow(
        GeneralBadRequestException,
      );
    });

    it('字段类型错误时应该抛出异常', () => {
      const config = {
        name: 123, // 应该是字符串
        age: 25,
      };

      expect(() => ConfigValidator.validate(TestConfig, config)).toThrow(
        GeneralBadRequestException,
      );
    });

    it('数值超出范围时应该抛出异常', () => {
      const config = {
        name: 'Test',
        age: 150, // 超过 Max(100)
      };

      expect(() => ConfigValidator.validate(TestConfig, config)).toThrow(
        GeneralBadRequestException,
      );
    });

    it('异常应该包含详细的验证错误', () => {
      const config = {
        name: 123,
        age: 'invalid',
      };

      try {
        ConfigValidator.validate(TestConfig, config);
        fail('Should throw exception');
      } catch (error) {
        expect(error).toBeInstanceOf(GeneralBadRequestException);
        expect((error as GeneralBadRequestException).data.errors).toBeDefined();
        expect((error as GeneralBadRequestException).data.errors.length).toBeGreaterThan(0);
      }
    });

    it('应该支持自定义验证选项', () => {
      const config = {
        name: 'Test',
        age: 25,
        extra: 'field', // 额外字段
      };

      // whitelist: true, forbidNonWhitelisted: true 应该移除额外字段
      const result = ConfigValidator.validate(TestConfig, config, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      expect(result).toBeInstanceOf(TestConfig);
      expect((result as any).extra).toBeUndefined();
    });
  });
});

