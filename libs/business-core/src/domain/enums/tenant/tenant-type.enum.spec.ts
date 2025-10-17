/**
 * 租户类型枚举测试
 *
 * @description 测试租户类型枚举和工具类的功能
 * @since 1.0.0
 */

import {
  TenantType,
  TenantTypeUtils,
  TenantQuota,
} from "./tenant-type.enum.js";

describe("TenantType", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的租户类型", () => {
      expect(TenantType.ENTERPRISE).toBe("ENTERPRISE");
      expect(TenantType.COMMUNITY).toBe("COMMUNITY");
      expect(TenantType.TEAM).toBe("TEAM");
      expect(TenantType.PERSONAL).toBe("PERSONAL");
    });
  });
});

describe("TenantTypeUtils", () => {
  describe("isEnterprise", () => {
    it("应该正确识别企业租户", () => {
      expect(TenantTypeUtils.isEnterprise(TenantType.ENTERPRISE)).toBe(true);
      expect(TenantTypeUtils.isEnterprise(TenantType.COMMUNITY)).toBe(false);
      expect(TenantTypeUtils.isEnterprise(TenantType.TEAM)).toBe(false);
      expect(TenantTypeUtils.isEnterprise(TenantType.PERSONAL)).toBe(false);
    });
  });

  describe("isCommunity", () => {
    it("应该正确识别社群租户", () => {
      expect(TenantTypeUtils.isCommunity(TenantType.COMMUNITY)).toBe(true);
      expect(TenantTypeUtils.isCommunity(TenantType.ENTERPRISE)).toBe(false);
      expect(TenantTypeUtils.isCommunity(TenantType.TEAM)).toBe(false);
      expect(TenantTypeUtils.isCommunity(TenantType.PERSONAL)).toBe(false);
    });
  });

  describe("isTeam", () => {
    it("应该正确识别团队租户", () => {
      expect(TenantTypeUtils.isTeam(TenantType.TEAM)).toBe(true);
      expect(TenantTypeUtils.isTeam(TenantType.ENTERPRISE)).toBe(false);
      expect(TenantTypeUtils.isTeam(TenantType.COMMUNITY)).toBe(false);
      expect(TenantTypeUtils.isTeam(TenantType.PERSONAL)).toBe(false);
    });
  });

  describe("isPersonal", () => {
    it("应该正确识别个人租户", () => {
      expect(TenantTypeUtils.isPersonal(TenantType.PERSONAL)).toBe(true);
      expect(TenantTypeUtils.isPersonal(TenantType.ENTERPRISE)).toBe(false);
      expect(TenantTypeUtils.isPersonal(TenantType.COMMUNITY)).toBe(false);
      expect(TenantTypeUtils.isPersonal(TenantType.TEAM)).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(TenantTypeUtils.getDescription(TenantType.ENTERPRISE)).toBe(
        "大型企业客户，拥有完整功能权限和最大资源配额",
      );
      expect(TenantTypeUtils.getDescription(TenantType.COMMUNITY)).toBe(
        "社群组织，支持多用户协作和分享功能",
      );
      expect(TenantTypeUtils.getDescription(TenantType.TEAM)).toBe(
        "小型团队，提供基础协作功能",
      );
      expect(TenantTypeUtils.getDescription(TenantType.PERSONAL)).toBe(
        "个人用户，提供基础功能权限",
      );
    });
  });

  describe("getDisplayName", () => {
    it("应该返回正确的显示名称", () => {
      expect(TenantTypeUtils.getDisplayName(TenantType.ENTERPRISE)).toBe(
        "企业租户",
      );
      expect(TenantTypeUtils.getDisplayName(TenantType.COMMUNITY)).toBe(
        "社群租户",
      );
      expect(TenantTypeUtils.getDisplayName(TenantType.TEAM)).toBe("团队租户");
      expect(TenantTypeUtils.getDisplayName(TenantType.PERSONAL)).toBe(
        "个人租户",
      );
    });
  });

  describe("getPermissionLevel", () => {
    it("应该返回正确的权限级别", () => {
      expect(TenantTypeUtils.getPermissionLevel(TenantType.ENTERPRISE)).toBe(4);
      expect(TenantTypeUtils.getPermissionLevel(TenantType.COMMUNITY)).toBe(3);
      expect(TenantTypeUtils.getPermissionLevel(TenantType.TEAM)).toBe(2);
      expect(TenantTypeUtils.getPermissionLevel(TenantType.PERSONAL)).toBe(1);
    });
  });

  describe("getQuota", () => {
    it("应该返回正确的配额信息", () => {
      const enterpriseQuota = TenantTypeUtils.getQuota(TenantType.ENTERPRISE);
      expect(enterpriseQuota.maxUsers).toBe(10000);
      expect(enterpriseQuota.maxStorage).toBe(1000);
      expect(enterpriseQuota.maxProjects).toBe(1000);
      expect(enterpriseQuota.maxOrganizations).toBe(100);

      const personalQuota = TenantTypeUtils.getQuota(TenantType.PERSONAL);
      expect(personalQuota.maxUsers).toBe(1);
      expect(personalQuota.maxStorage).toBe(1);
      expect(personalQuota.maxProjects).toBe(5);
      expect(personalQuota.maxOrganizations).toBe(1);
    });
  });

  describe("supportsMultiUser", () => {
    it("应该正确判断是否支持多用户", () => {
      expect(TenantTypeUtils.supportsMultiUser(TenantType.ENTERPRISE)).toBe(
        true,
      );
      expect(TenantTypeUtils.supportsMultiUser(TenantType.COMMUNITY)).toBe(
        true,
      );
      expect(TenantTypeUtils.supportsMultiUser(TenantType.TEAM)).toBe(true);
      expect(TenantTypeUtils.supportsMultiUser(TenantType.PERSONAL)).toBe(
        false,
      );
    });
  });

  describe("supportsOrganizationManagement", () => {
    it("应该正确判断是否支持组织管理", () => {
      expect(
        TenantTypeUtils.supportsOrganizationManagement(TenantType.ENTERPRISE),
      ).toBe(true);
      expect(
        TenantTypeUtils.supportsOrganizationManagement(TenantType.COMMUNITY),
      ).toBe(true);
      expect(
        TenantTypeUtils.supportsOrganizationManagement(TenantType.TEAM),
      ).toBe(false);
      expect(
        TenantTypeUtils.supportsOrganizationManagement(TenantType.PERSONAL),
      ).toBe(false);
    });
  });

  describe("supportsAdvancedFeatures", () => {
    it("应该正确判断是否支持高级功能", () => {
      expect(
        TenantTypeUtils.supportsAdvancedFeatures(TenantType.ENTERPRISE),
      ).toBe(true);
      expect(
        TenantTypeUtils.supportsAdvancedFeatures(TenantType.COMMUNITY),
      ).toBe(false);
      expect(TenantTypeUtils.supportsAdvancedFeatures(TenantType.TEAM)).toBe(
        false,
      );
      expect(
        TenantTypeUtils.supportsAdvancedFeatures(TenantType.PERSONAL),
      ).toBe(false);
    });
  });

  describe("hasHigherPermissionLevel", () => {
    it("应该正确比较权限级别", () => {
      expect(
        TenantTypeUtils.hasHigherPermissionLevel(
          TenantType.ENTERPRISE,
          TenantType.COMMUNITY,
        ),
      ).toBe(true);
      expect(
        TenantTypeUtils.hasHigherPermissionLevel(
          TenantType.COMMUNITY,
          TenantType.TEAM,
        ),
      ).toBe(true);
      expect(
        TenantTypeUtils.hasHigherPermissionLevel(
          TenantType.TEAM,
          TenantType.PERSONAL,
        ),
      ).toBe(true);
      expect(
        TenantTypeUtils.hasHigherPermissionLevel(
          TenantType.PERSONAL,
          TenantType.ENTERPRISE,
        ),
      ).toBe(false);
    });
  });

  describe("comparePermissionLevel", () => {
    it("应该正确比较权限级别", () => {
      expect(
        TenantTypeUtils.comparePermissionLevel(
          TenantType.ENTERPRISE,
          TenantType.COMMUNITY,
        ),
      ).toBe(1);
      expect(
        TenantTypeUtils.comparePermissionLevel(
          TenantType.COMMUNITY,
          TenantType.ENTERPRISE,
        ),
      ).toBe(-1);
      expect(
        TenantTypeUtils.comparePermissionLevel(
          TenantType.TEAM,
          TenantType.TEAM,
        ),
      ).toBe(0);
    });
  });

  describe("getAllTypes", () => {
    it("应该返回所有租户类型", () => {
      const allTypes = TenantTypeUtils.getAllTypes();
      expect(allTypes).toHaveLength(4);
      expect(allTypes).toContain(TenantType.ENTERPRISE);
      expect(allTypes).toContain(TenantType.COMMUNITY);
      expect(allTypes).toContain(TenantType.TEAM);
      expect(allTypes).toContain(TenantType.PERSONAL);
    });
  });

  describe("getEnterpriseLevelTypes", () => {
    it("应该返回企业级租户类型（企业、社群）", () => {
      const enterpriseLevelTypes = TenantTypeUtils.getEnterpriseLevelTypes();
      expect(enterpriseLevelTypes).toHaveLength(2);
      expect(enterpriseLevelTypes).toContain(TenantType.ENTERPRISE);
      expect(enterpriseLevelTypes).toContain(TenantType.COMMUNITY);
    });
  });

  describe("getBasicLevelTypes", () => {
    it("应该返回基础级租户类型（团队、个人）", () => {
      const basicLevelTypes = TenantTypeUtils.getBasicLevelTypes();
      expect(basicLevelTypes).toHaveLength(2);
      expect(basicLevelTypes).toContain(TenantType.TEAM);
      expect(basicLevelTypes).toContain(TenantType.PERSONAL);
    });
  });
});
