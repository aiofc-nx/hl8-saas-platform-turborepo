/**
 * 组织类型枚举测试
 *
 * @description 测试组织类型枚举和工具类的功能
 * @since 1.0.0
 */

import {
  OrganizationType,
  OrganizationTypeUtils,
} from "./organization-type.enum.js";

describe("OrganizationType", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的组织类型", () => {
      expect(OrganizationType.COMMITTEE).toBe("COMMITTEE");
      expect(OrganizationType.PROJECT_TEAM).toBe("PROJECT_TEAM");
      expect(OrganizationType.QUALITY_GROUP).toBe("QUALITY_GROUP");
      expect(OrganizationType.PERFORMANCE_GROUP).toBe("PERFORMANCE_GROUP");
    });
  });
});

describe("OrganizationTypeUtils", () => {
  describe("isCommittee", () => {
    it("应该正确识别委员会", () => {
      expect(
        OrganizationTypeUtils.isCommittee(OrganizationType.COMMITTEE),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isCommittee(OrganizationType.PROJECT_TEAM),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isCommittee(OrganizationType.QUALITY_GROUP),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isCommittee(OrganizationType.PERFORMANCE_GROUP),
      ).toBe(false);
    });
  });

  describe("isProjectTeam", () => {
    it("应该正确识别项目组", () => {
      expect(
        OrganizationTypeUtils.isProjectTeam(OrganizationType.PROJECT_TEAM),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isProjectTeam(OrganizationType.COMMITTEE),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isProjectTeam(OrganizationType.QUALITY_GROUP),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isProjectTeam(OrganizationType.PERFORMANCE_GROUP),
      ).toBe(false);
    });
  });

  describe("isQualityGroup", () => {
    it("应该正确识别质量组", () => {
      expect(
        OrganizationTypeUtils.isQualityGroup(OrganizationType.QUALITY_GROUP),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isQualityGroup(OrganizationType.COMMITTEE),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isQualityGroup(OrganizationType.PROJECT_TEAM),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isQualityGroup(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(false);
    });
  });

  describe("isPerformanceGroup", () => {
    it("应该正确识别绩效组", () => {
      expect(
        OrganizationTypeUtils.isPerformanceGroup(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isPerformanceGroup(OrganizationType.COMMITTEE),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isPerformanceGroup(OrganizationType.PROJECT_TEAM),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isPerformanceGroup(
          OrganizationType.QUALITY_GROUP,
        ),
      ).toBe(false);
    });
  });

  describe("isDecisionType", () => {
    it("应该正确识别决策类型", () => {
      expect(
        OrganizationTypeUtils.isDecisionType(OrganizationType.COMMITTEE),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isDecisionType(OrganizationType.PROJECT_TEAM),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isDecisionType(OrganizationType.QUALITY_GROUP),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isDecisionType(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(false);
    });
  });

  describe("isExecutionType", () => {
    it("应该正确识别执行类型", () => {
      expect(
        OrganizationTypeUtils.isExecutionType(OrganizationType.PROJECT_TEAM),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isExecutionType(OrganizationType.COMMITTEE),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isExecutionType(OrganizationType.QUALITY_GROUP),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isExecutionType(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(false);
    });
  });

  describe("isProfessionalType", () => {
    it("应该正确识别专业类型", () => {
      expect(
        OrganizationTypeUtils.isProfessionalType(
          OrganizationType.QUALITY_GROUP,
        ),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isProfessionalType(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.isProfessionalType(OrganizationType.COMMITTEE),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.isProfessionalType(OrganizationType.PROJECT_TEAM),
      ).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(
        OrganizationTypeUtils.getDescription(OrganizationType.COMMITTEE),
      ).toBe("委员会");
      expect(
        OrganizationTypeUtils.getDescription(OrganizationType.PROJECT_TEAM),
      ).toBe("项目组");
      expect(
        OrganizationTypeUtils.getDescription(OrganizationType.QUALITY_GROUP),
      ).toBe("质量组");
      expect(
        OrganizationTypeUtils.getDescription(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe("绩效组");
    });
  });

  describe("getFunctionScope", () => {
    it("应该返回正确的功能范围", () => {
      expect(
        OrganizationTypeUtils.getFunctionScope(OrganizationType.COMMITTEE),
      ).toBe("决策管理、战略规划、重大事项审批");
      expect(
        OrganizationTypeUtils.getFunctionScope(OrganizationType.PROJECT_TEAM),
      ).toBe("项目执行、任务分配、进度管理");
      expect(
        OrganizationTypeUtils.getFunctionScope(OrganizationType.QUALITY_GROUP),
      ).toBe("质量监督、标准制定、流程优化");
      expect(
        OrganizationTypeUtils.getFunctionScope(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe("绩效评估、考核管理、激励制度");
    });
  });

  describe("getPermissionLevel", () => {
    it("应该返回正确的权限级别", () => {
      expect(
        OrganizationTypeUtils.getPermissionLevel(OrganizationType.COMMITTEE),
      ).toBe(4);
      expect(
        OrganizationTypeUtils.getPermissionLevel(OrganizationType.PROJECT_TEAM),
      ).toBe(3);
      expect(
        OrganizationTypeUtils.getPermissionLevel(
          OrganizationType.QUALITY_GROUP,
        ),
      ).toBe(2);
      expect(
        OrganizationTypeUtils.getPermissionLevel(
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(2);
    });
  });

  describe("hasHigherPermissionLevel", () => {
    it("应该正确比较权限级别", () => {
      expect(
        OrganizationTypeUtils.hasHigherPermissionLevel(
          OrganizationType.COMMITTEE,
          OrganizationType.PROJECT_TEAM,
        ),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.hasHigherPermissionLevel(
          OrganizationType.PROJECT_TEAM,
          OrganizationType.QUALITY_GROUP,
        ),
      ).toBe(true);
      expect(
        OrganizationTypeUtils.hasHigherPermissionLevel(
          OrganizationType.QUALITY_GROUP,
          OrganizationType.COMMITTEE,
        ),
      ).toBe(false);
      expect(
        OrganizationTypeUtils.hasHigherPermissionLevel(
          OrganizationType.QUALITY_GROUP,
          OrganizationType.QUALITY_GROUP,
        ),
      ).toBe(false);
    });
  });

  describe("comparePermissionLevel", () => {
    it("应该正确比较权限级别", () => {
      expect(
        OrganizationTypeUtils.comparePermissionLevel(
          OrganizationType.COMMITTEE,
          OrganizationType.PROJECT_TEAM,
        ),
      ).toBe(1);
      expect(
        OrganizationTypeUtils.comparePermissionLevel(
          OrganizationType.PROJECT_TEAM,
          OrganizationType.COMMITTEE,
        ),
      ).toBe(-1);
      expect(
        OrganizationTypeUtils.comparePermissionLevel(
          OrganizationType.QUALITY_GROUP,
          OrganizationType.PERFORMANCE_GROUP,
        ),
      ).toBe(0);
    });
  });

  describe("getAllTypes", () => {
    it("应该返回所有组织类型", () => {
      const allTypes = OrganizationTypeUtils.getAllTypes();
      expect(allTypes).toHaveLength(4);
      expect(allTypes).toContain(OrganizationType.COMMITTEE);
      expect(allTypes).toContain(OrganizationType.PROJECT_TEAM);
      expect(allTypes).toContain(OrganizationType.QUALITY_GROUP);
      expect(allTypes).toContain(OrganizationType.PERFORMANCE_GROUP);
    });
  });

  describe("getDecisionTypes", () => {
    it("应该返回决策类型（委员会）", () => {
      const decisionTypes = OrganizationTypeUtils.getDecisionTypes();
      expect(decisionTypes).toHaveLength(1);
      expect(decisionTypes).toContain(OrganizationType.COMMITTEE);
    });
  });

  describe("getExecutionTypes", () => {
    it("应该返回执行类型（项目组）", () => {
      const executionTypes = OrganizationTypeUtils.getExecutionTypes();
      expect(executionTypes).toHaveLength(1);
      expect(executionTypes).toContain(OrganizationType.PROJECT_TEAM);
    });
  });

  describe("getProfessionalTypes", () => {
    it("应该返回专业类型（质量组、绩效组）", () => {
      const professionalTypes = OrganizationTypeUtils.getProfessionalTypes();
      expect(professionalTypes).toHaveLength(2);
      expect(professionalTypes).toContain(OrganizationType.QUALITY_GROUP);
      expect(professionalTypes).toContain(OrganizationType.PERFORMANCE_GROUP);
    });
  });
});
