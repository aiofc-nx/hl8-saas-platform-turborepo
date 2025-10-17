/**
 * 权限动作枚举测试
 *
 * @description 测试权限动作枚举和工具类的功能
 * @since 1.0.0
 */

import {
  PermissionAction,
  PermissionActionUtils,
} from "./permission-action.enum.js";

describe("PermissionAction", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的动作", () => {
      expect(PermissionAction.CREATE).toBe("CREATE");
      expect(PermissionAction.READ).toBe("READ");
      expect(PermissionAction.UPDATE).toBe("UPDATE");
      expect(PermissionAction.DELETE).toBe("DELETE");
      expect(PermissionAction.EXECUTE).toBe("EXECUTE");
      expect(PermissionAction.MANAGE).toBe("MANAGE");
      expect(PermissionAction.ASSIGN).toBe("ASSIGN");
      expect(PermissionAction.APPROVE).toBe("APPROVE");
      expect(PermissionAction.EXPORT).toBe("EXPORT");
      expect(PermissionAction.IMPORT).toBe("IMPORT");
    });
  });
});

describe("PermissionActionUtils", () => {
  describe("isCreateAction", () => {
    it("应该正确识别创建动作", () => {
      expect(
        PermissionActionUtils.isCreateAction(PermissionAction.CREATE),
      ).toBe(true);
      expect(PermissionActionUtils.isCreateAction(PermissionAction.READ)).toBe(
        false,
      );
      expect(
        PermissionActionUtils.isCreateAction(PermissionAction.MANAGE),
      ).toBe(false);
    });
  });

  describe("isReadAction", () => {
    it("应该正确识别读取动作", () => {
      expect(PermissionActionUtils.isReadAction(PermissionAction.READ)).toBe(
        true,
      );
      expect(PermissionActionUtils.isReadAction(PermissionAction.CREATE)).toBe(
        false,
      );
      expect(PermissionActionUtils.isReadAction(PermissionAction.MANAGE)).toBe(
        false,
      );
    });
  });

  describe("isManageAction", () => {
    it("应该正确识别管理动作", () => {
      expect(
        PermissionActionUtils.isManageAction(PermissionAction.MANAGE),
      ).toBe(true);
      expect(
        PermissionActionUtils.isManageAction(PermissionAction.CREATE),
      ).toBe(false);
      expect(PermissionActionUtils.isManageAction(PermissionAction.READ)).toBe(
        false,
      );
    });
  });

  describe("hasHigherPermission", () => {
    it("应该正确比较权限层级", () => {
      expect(
        PermissionActionUtils.hasHigherPermission(
          PermissionAction.MANAGE,
          PermissionAction.READ,
        ),
      ).toBe(true);
      expect(
        PermissionActionUtils.hasHigherPermission(
          PermissionAction.CREATE,
          PermissionAction.READ,
        ),
      ).toBe(true);
      expect(
        PermissionActionUtils.hasHigherPermission(
          PermissionAction.READ,
          PermissionAction.MANAGE,
        ),
      ).toBe(false);
      expect(
        PermissionActionUtils.hasHigherPermission(
          PermissionAction.READ,
          PermissionAction.READ,
        ),
      ).toBe(false);
    });
  });

  describe("hasPermissionOrHigher", () => {
    it("应该正确比较权限层级（包含相等）", () => {
      expect(
        PermissionActionUtils.hasPermissionOrHigher(
          PermissionAction.MANAGE,
          PermissionAction.READ,
        ),
      ).toBe(true);
      expect(
        PermissionActionUtils.hasPermissionOrHigher(
          PermissionAction.READ,
          PermissionAction.READ,
        ),
      ).toBe(true);
      expect(
        PermissionActionUtils.hasPermissionOrHigher(
          PermissionAction.READ,
          PermissionAction.MANAGE,
        ),
      ).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(
        PermissionActionUtils.getDescription(PermissionAction.CREATE),
      ).toBe("创建");
      expect(PermissionActionUtils.getDescription(PermissionAction.READ)).toBe(
        "读取",
      );
      expect(
        PermissionActionUtils.getDescription(PermissionAction.UPDATE),
      ).toBe("更新");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.DELETE),
      ).toBe("删除");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.EXECUTE),
      ).toBe("执行");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.MANAGE),
      ).toBe("管理");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.ASSIGN),
      ).toBe("分配");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.APPROVE),
      ).toBe("审批");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.EXPORT),
      ).toBe("导出");
      expect(
        PermissionActionUtils.getDescription(PermissionAction.IMPORT),
      ).toBe("导入");
    });
  });

  describe("getAllActions", () => {
    it("应该返回所有动作", () => {
      const allActions = PermissionActionUtils.getAllActions();
      expect(allActions).toHaveLength(10);
      expect(allActions).toContain(PermissionAction.CREATE);
      expect(allActions).toContain(PermissionAction.READ);
      expect(allActions).toContain(PermissionAction.UPDATE);
      expect(allActions).toContain(PermissionAction.DELETE);
      expect(allActions).toContain(PermissionAction.EXECUTE);
      expect(allActions).toContain(PermissionAction.MANAGE);
      expect(allActions).toContain(PermissionAction.ASSIGN);
      expect(allActions).toContain(PermissionAction.APPROVE);
      expect(allActions).toContain(PermissionAction.EXPORT);
      expect(allActions).toContain(PermissionAction.IMPORT);
    });
  });

  describe("getBasicActions", () => {
    it("应该返回基础动作（创建、读取、更新、删除）", () => {
      const basicActions = PermissionActionUtils.getBasicActions();
      expect(basicActions).toHaveLength(4);
      expect(basicActions).toContain(PermissionAction.CREATE);
      expect(basicActions).toContain(PermissionAction.READ);
      expect(basicActions).toContain(PermissionAction.UPDATE);
      expect(basicActions).toContain(PermissionAction.DELETE);
      expect(basicActions).not.toContain(PermissionAction.MANAGE);
      expect(basicActions).not.toContain(PermissionAction.ASSIGN);
    });
  });
});
