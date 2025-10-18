import {
  BusinessRuleType,
  BusinessRuleTypeUtils,
} from "./business-rule-type.enum.js";

describe("BusinessRuleType", () => {
  describe("枚举值", () => {
    it("应该包含所有预期的业务规则类型", () => {
      expect(BusinessRuleType.FORMAT_VALIDATION).toBe("format_validation");
      expect(BusinessRuleType.BUSINESS_LOGIC).toBe("business_logic");
      expect(BusinessRuleType.DATA_INTEGRITY).toBe("data_integrity");
      expect(BusinessRuleType.PERMISSION_CHECK).toBe("permission_check");
      expect(BusinessRuleType.QUOTA_LIMIT).toBe("quota_limit");
      expect(BusinessRuleType.TIME_CONSTRAINT).toBe("time_constraint");
      expect(BusinessRuleType.DEPENDENCY_CHECK).toBe("dependency_check");
    });

    it("应该包含7个规则类型", () => {
      const types = Object.values(BusinessRuleType);
      expect(types).toHaveLength(7);
    });
  });
});

describe("BusinessRuleTypeUtils", () => {
  describe("类型检查方法", () => {
    it("应该正确识别格式验证规则", () => {
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.BUSINESS_LOGIC,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.DATA_INTEGRITY,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.TIME_CONSTRAINT,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isFormatValidation(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(false);
    });

    it("应该正确识别业务逻辑规则", () => {
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(BusinessRuleType.BUSINESS_LOGIC),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(BusinessRuleType.DATA_INTEGRITY),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(BusinessRuleType.TIME_CONSTRAINT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isBusinessLogic(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(false);
    });

    it("应该正确识别数据完整性规则", () => {
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(BusinessRuleType.DATA_INTEGRITY),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(BusinessRuleType.BUSINESS_LOGIC),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(BusinessRuleType.TIME_CONSTRAINT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDataIntegrity(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(false);
    });

    it("应该正确识别权限验证规则", () => {
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.BUSINESS_LOGIC,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.DATA_INTEGRITY,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.TIME_CONSTRAINT,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isPermissionCheck(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(false);
    });

    it("应该正确识别配额限制规则", () => {
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.FORMAT_VALIDATION),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.BUSINESS_LOGIC),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.DATA_INTEGRITY),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.PERMISSION_CHECK),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.TIME_CONSTRAINT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isQuotaLimit(BusinessRuleType.DEPENDENCY_CHECK),
      ).toBe(false);
    });

    it("应该正确识别时间约束规则", () => {
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(
          BusinessRuleType.TIME_CONSTRAINT,
        ),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(BusinessRuleType.BUSINESS_LOGIC),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(BusinessRuleType.DATA_INTEGRITY),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isTimeConstraint(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(false);
    });

    it("应该正确识别依赖关系规则", () => {
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.DEPENDENCY_CHECK,
        ),
      ).toBe(true);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.BUSINESS_LOGIC,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.DATA_INTEGRITY,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.PERMISSION_CHECK,
        ),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(BusinessRuleType.QUOTA_LIMIT),
      ).toBe(false);
      expect(
        BusinessRuleTypeUtils.isDependencyCheck(
          BusinessRuleType.TIME_CONSTRAINT,
        ),
      ).toBe(false);
    });
  });

  describe("描述和列表方法", () => {
    it("应该返回正确的类型描述", () => {
      expect(
        BusinessRuleTypeUtils.getDescription(
          BusinessRuleType.FORMAT_VALIDATION,
        ),
      ).toBe("格式验证规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.BUSINESS_LOGIC),
      ).toBe("业务逻辑规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.DATA_INTEGRITY),
      ).toBe("数据完整性规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.PERMISSION_CHECK),
      ).toBe("权限验证规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.QUOTA_LIMIT),
      ).toBe("配额限制规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.TIME_CONSTRAINT),
      ).toBe("时间约束规则");
      expect(
        BusinessRuleTypeUtils.getDescription(BusinessRuleType.DEPENDENCY_CHECK),
      ).toBe("依赖关系规则");
    });

    it("应该返回所有类型", () => {
      const allTypes = BusinessRuleTypeUtils.getAllTypes();
      expect(allTypes).toHaveLength(7);
      expect(allTypes).toContain(BusinessRuleType.FORMAT_VALIDATION);
      expect(allTypes).toContain(BusinessRuleType.BUSINESS_LOGIC);
      expect(allTypes).toContain(BusinessRuleType.DATA_INTEGRITY);
      expect(allTypes).toContain(BusinessRuleType.PERMISSION_CHECK);
      expect(allTypes).toContain(BusinessRuleType.QUOTA_LIMIT);
      expect(allTypes).toContain(BusinessRuleType.TIME_CONSTRAINT);
      expect(allTypes).toContain(BusinessRuleType.DEPENDENCY_CHECK);
    });

    it("应该返回验证规则类型", () => {
      const validationTypes = BusinessRuleTypeUtils.getValidationTypes();
      expect(validationTypes).toHaveLength(2);
      expect(validationTypes).toContain(BusinessRuleType.FORMAT_VALIDATION);
      expect(validationTypes).toContain(BusinessRuleType.DATA_INTEGRITY);
    });

    it("应该返回业务规则类型", () => {
      const businessTypes = BusinessRuleTypeUtils.getBusinessTypes();
      expect(businessTypes).toHaveLength(5);
      expect(businessTypes).toContain(BusinessRuleType.BUSINESS_LOGIC);
      expect(businessTypes).toContain(BusinessRuleType.PERMISSION_CHECK);
      expect(businessTypes).toContain(BusinessRuleType.QUOTA_LIMIT);
      expect(businessTypes).toContain(BusinessRuleType.TIME_CONSTRAINT);
      expect(businessTypes).toContain(BusinessRuleType.DEPENDENCY_CHECK);
    });
  });

  describe("边界情况", () => {
    it("应该处理未知类型", () => {
      const unknownType = "unknown_type" as BusinessRuleType;
      expect(BusinessRuleTypeUtils.getDescription(unknownType)).toBe(
        "未知业务规则类型",
      );
    });

    it("应该正确分类规则类型", () => {
      // 验证规则类型
      expect(BusinessRuleTypeUtils.getValidationTypes()).toEqual([
        BusinessRuleType.FORMAT_VALIDATION,
        BusinessRuleType.DATA_INTEGRITY,
      ]);

      // 业务规则类型
      expect(BusinessRuleTypeUtils.getBusinessTypes()).toEqual([
        BusinessRuleType.BUSINESS_LOGIC,
        BusinessRuleType.PERMISSION_CHECK,
        BusinessRuleType.QUOTA_LIMIT,
        BusinessRuleType.TIME_CONSTRAINT,
        BusinessRuleType.DEPENDENCY_CHECK,
      ]);
    });
  });
});
