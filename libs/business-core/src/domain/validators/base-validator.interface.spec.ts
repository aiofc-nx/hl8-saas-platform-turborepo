import {
  IValidationResult,
  IValidator,
  IValidatorFactory,
  IValidatorManager,
  ValidationContext,
  ValidationOptions,
} from "./base-validator.interface.js";

describe("Base Validator Interface", () => {
  describe("IValidationResult", () => {
    it("应该定义验证结果接口", () => {
      const result: IValidationResult = {
        isValid: true,
        errors: [],
        context: { field: "test" },
      };

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.context).toEqual({ field: "test" });
    });
  });

  describe("IValidator", () => {
    it("应该定义验证器接口方法", () => {
      const validator: IValidator = {
        validate: jest.fn(),
        validateAsync: jest.fn(),
        isValid: jest.fn(),
        getErrors: jest.fn(),
      };

      expect(validator.validate).toBeDefined();
      expect(validator.validateAsync).toBeDefined();
      expect(validator.isValid).toBeDefined();
      expect(validator.getErrors).toBeDefined();
    });
  });

  describe("IValidatorFactory", () => {
    it("应该定义验证器工厂接口方法", () => {
      const factory: IValidatorFactory = {
        createValidator: jest.fn(),
        getValidator: jest.fn(),
        registerValidator: jest.fn(),
        unregisterValidator: jest.fn(),
      };

      expect(factory.createValidator).toBeDefined();
      expect(factory.getValidator).toBeDefined();
      expect(factory.registerValidator).toBeDefined();
      expect(factory.unregisterValidator).toBeDefined();
    });
  });

  describe("IValidatorManager", () => {
    it("应该定义验证器管理器接口方法", () => {
      const manager: IValidatorManager = {
        validate: jest.fn(),
        validateAsync: jest.fn(),
        registerValidator: jest.fn(),
        unregisterValidator: jest.fn(),
        getValidator: jest.fn(),
        listValidators: jest.fn(),
      };

      expect(manager.validate).toBeDefined();
      expect(manager.validateAsync).toBeDefined();
      expect(manager.registerValidator).toBeDefined();
      expect(manager.unregisterValidator).toBeDefined();
      expect(manager.getValidator).toBeDefined();
      expect(manager.listValidators).toBeDefined();
    });
  });

  describe("ValidationContext", () => {
    it("应该定义验证上下文", () => {
      const context: ValidationContext = {
        field: "test",
        value: "test-value",
        metadata: { type: "string" },
      };

      expect(context.field).toBe("test");
      expect(context.value).toBe("test-value");
      expect(context.metadata).toEqual({ type: "string" });
    });
  });

  describe("ValidationOptions", () => {
    it("应该定义验证选项", () => {
      const options: ValidationOptions = {
        strict: true,
        allowEmpty: false,
        customRules: [],
      };

      expect(options.strict).toBe(true);
      expect(options.allowEmpty).toBe(false);
      expect(options.customRules).toEqual([]);
    });
  });
});
