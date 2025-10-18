/**
 * 部门实体单元测试
 *
 * @description 测试部门实体的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { Department } from "./department.entity.js";
import { DepartmentLevel } from "../../value-objects/types/department-level.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
  DomainValidationException,
} from "../../../common/exceptions/business.exceptions.js";

describe("Department Entity", () => {
  let validEntityId: EntityId;
  let validDepartmentProps: any;
  let validAuditInfo: any;

  beforeEach(() => {
    validEntityId = TenantId.create("123e4567-e89b-4d3a-a456-426614174000");
    validDepartmentProps = {
      name: "Test Department",
      level: DepartmentLevel.create(1),
      description: "Test department description",
      isActive: true,
      parentId: undefined,
      path: "/test-dept",
      sortOrder: 1,
      managerId: undefined,
      code: "TD001",
    };
    validAuditInfo = {
      createdBy: "admin",
      createdAt: new Date(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建部门实体", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(department.name).toBe("Test Department");
      expect(department.level.value).toBe(DepartmentLevel.create(1).value);
      expect(department.description).toBe("Test department description");
      expect(department.isActive).toBe(true);
      expect(department.parentId).toBeUndefined();
      expect(department.path).toBe("/test-dept");
      expect(department.sortOrder).toBe(1);
      expect(department.managerId).toBeUndefined();
      expect(department.code).toBe("TD001");
    });

    it("应该成功创建部门实体（不提供日志记录器）", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(department).toBeDefined();
      expect(department.name).toBe("Test Department");
    });

    it("应该验证部门名称不能为空", () => {
      const invalidProps = { ...validDepartmentProps, name: "" };

      expect(() => {
        new Department(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证部门名称长度不能超过100字符", () => {
      const invalidProps = { ...validDepartmentProps, name: "a".repeat(101) };

      expect(() => {
        new Department(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证部门层级不能为空", () => {
      const invalidProps = { ...validDepartmentProps, level: null as any };

      expect(() => {
        new Department(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证部门层级必须在1-8之间", () => {
      expect(() => {
        DepartmentLevel.create(9);
      }).toThrow(DomainValidationException);
    });
  });

  describe("更新部门名称", () => {
    it("应该成功更新部门名称", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("New Department Name");

      expect(department.name).toBe("New Department Name");
    });

    it("应该自动去除名称前后空格", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("  New Department Name  ");

      expect(department.name).toBe("New Department Name");
    });

    it("应该验证新名称不能为空", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateName("");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新名称长度不能超过100字符", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateName("a".repeat(101));
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新部门描述", () => {
    it("应该成功更新部门描述", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateDescription("New department description");

      expect(department.description).toBe("New department description");
    });

    it("应该允许空描述", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateDescription("");

      expect(department.description).toBe("");
    });
  });

  describe("更新部门层级", () => {
    it("应该成功更新部门层级", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateLevel(DepartmentLevel.create(2));

      expect(department.level.value).toBe(DepartmentLevel.create(2).value);
    });

    it("应该验证新层级不能为空", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateLevel(null as any);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新层级必须在1-8之间", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateLevel(DepartmentLevel.create(9));
      }).toThrow(DomainValidationException);
    });
  });

  describe("设置父部门", () => {
    it("应该成功设置父部门", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");

      department.setParent(parentId);

      expect(department.parentId).toBe(parentId);
    });

    it("应该验证不能设置自己为父部门", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.setParent(validEntityId);
      }).toThrow(DomainStateException);
    });

    it("应该允许清除父部门", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");
      department.setParent(parentId);

      department.removeParent();

      expect(department.parentId).toBeUndefined();
    });
  });

  describe("更新部门路径", () => {
    it("应该成功更新部门路径", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updatePath("/new/path");

      expect(department.path).toBe("/new/path");
    });

    it("应该验证路径格式", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updatePath("invalid-path");
      expect(department.path).toBe("invalid-path");
    });
  });

  describe("更新排序", () => {
    it("应该成功更新排序", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateSortOrder(5);

      expect(department.sortOrder).toBe(5);
    });

    it("应该验证排序不能为负数", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateSortOrder(-1);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("设置部门负责人", () => {
    it("应该成功设置部门负责人", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      const managerId = TenantId.create("123e4567-e89b-4d3a-a456-426614174002");

      department.setManager(managerId);

      expect(department.managerId).toBe(managerId);
    });

    it("应该允许清除部门负责人", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      const managerId = TenantId.create("123e4567-e89b-4d3a-a456-426614174002");
      department.setManager(managerId);

      department.removeManager();

      expect(department.managerId).toBeUndefined();
    });
  });

  describe("更新部门编码", () => {
    it("应该成功更新部门编码", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateCode("NEW001");

      expect(department.code).toBe("NEW001");
    });

    it("应该验证编码格式", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(() => {
        department.updateCode("invalid code");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("激活部门", () => {
    it("应该成功激活部门", () => {
      const inactiveProps = { ...validDepartmentProps, isActive: false };
      const department = new Department(
        validEntityId,
        inactiveProps,
        validAuditInfo,
      );

      department.activate();

      expect(department.isActive).toBe(true);
    });
  });

  describe("停用部门", () => {
    it("应该成功停用部门", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.deactivate();

      expect(department.isActive).toBe(false);
    });
  });

  describe("检查部门状态", () => {
    it("应该正确检查部门是否激活", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      expect(department.isActive).toBe(true);
    });

    it("应该正确检查部门是否停用", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      department.deactivate();

      expect(department.isActive).toBe(false);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的部门名称", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("Department-Name_123");

      expect(department.name).toBe("Department-Name_123");
    });

    it("应该处理Unicode字符的部门名称", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("技术部");

      expect(department.name).toBe("技术部");
    });

    it("应该处理数字开头的部门名称", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("2024年度部门");

      expect(department.name).toBe("2024年度部门");
    });

    it("应该处理包含空格的部门名称", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );

      department.updateName("Test Department Name");

      expect(department.name).toBe("Test Department Name");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量部门实体", () => {
      const startTime = Date.now();
      const departments = [];

      for (let i = 0; i < 1000; i++) {
        const deptProps = {
          ...validDepartmentProps,
          name: `Department ${i}`,
        };
        departments.push(
          new Department(
            TenantId.create("123e4567-e89b-4d3a-a456-426614174000"),
            deptProps,
            validAuditInfo,
          ),
        );
      }

      const endTime = Date.now();
      expect(departments).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速更新大量部门", () => {
      const department = new Department(
        validEntityId,
        validDepartmentProps,
        validAuditInfo,
      );
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        department.updateName(`Department ${i}`);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
