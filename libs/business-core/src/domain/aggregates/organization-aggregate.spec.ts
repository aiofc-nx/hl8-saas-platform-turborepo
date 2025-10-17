import { EntityId, TenantId } from "@hl8/isolation-model";
import { OrganizationAggregate } from "./organization-aggregate.js";
import { Organization } from "../entities/organization/organization.entity.js";
import { Department } from "../entities/department/department.entity.js";
import { OrganizationType } from "../value-objects/types/organization-type.vo.js";
import { DepartmentLevel } from "../value-objects/types/department-level.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("OrganizationAggregate", () => {
  let validEntityId: EntityId;
  let validOrganization: Organization;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    validAuditInfo = {
      createdBy: "test-user",
    };

    validOrganization = new Organization(
      TenantId.create("550e8400-e29b-41d4-a716-446655440001"),
      {
        name: "test-organization",
        description: "Test organization description",
        type: OrganizationType.create("COMMITTEE"),
        parentId: undefined,
        path: "/test-organization",
        sortOrder: 1,
        isActive: true,
      },
      validAuditInfo,
    );

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建组织聚合根", () => {
      const aggregate = new OrganizationAggregate(
        validEntityId,
        validOrganization,
        validAuditInfo,
        mockLogger,
      );

      expect(aggregate).toBeDefined();
      expect(aggregate.getOrganization()).toBe(validOrganization);
      expect(aggregate.getDepartments()).toEqual([]);
    });

    it("应该验证组织实体", () => {
      expect(() => {
        new OrganizationAggregate(
          validEntityId,
          null as any,
          validAuditInfo,
          mockLogger,
        );
      }).toThrow("组织实体不能为空");
    });
  });

  describe("组织管理", () => {
    let aggregate: OrganizationAggregate;

    beforeEach(() => {
      aggregate = new OrganizationAggregate(
        validEntityId,
        validOrganization,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该重命名组织", () => {
      const newName = "new-organization-name";
      aggregate.renameOrganization(newName);

      expect(aggregate.getOrganization().name).toBe(newName);
    });

    it("应该更新组织描述", () => {
      const newDescription = "New organization description";
      aggregate.updateDescription(newDescription);

      expect(aggregate.getOrganization().description).toBe(newDescription);
    });

    it("应该设置组织负责人", () => {
      const managerId = TenantId.create("550e8400-e29b-41d4-a716-446655440003");
      aggregate.setManager(managerId);

      // 注意：setManager 方法目前是 TODO 状态，只记录日志
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it("应该激活组织", () => {
      aggregate.activateOrganization();

      expect(aggregate.getOrganization().isActive).toBe(true);
    });

    it("应该停用组织", () => {
      aggregate.deactivateOrganization();

      expect(aggregate.getOrganization().isActive).toBe(false);
    });
  });

  describe("部门管理", () => {
    let aggregate: OrganizationAggregate;
    let department: Department;

    beforeEach(() => {
      aggregate = new OrganizationAggregate(
        validEntityId,
        validOrganization,
        validAuditInfo,
        mockLogger,
      );

      department = new Department(
        TenantId.create("550e8400-e29b-41d4-a716-446655440004"),
        {
          name: "test-department",
          description: "Test department description",
          level: DepartmentLevel.create(1),
          organizationId: validOrganization.id,
          parentId: undefined,
          managerId: undefined,
          path: "/test-organization/test-department",
          sortOrder: 1,
          isActive: true,
        },
        validAuditInfo,
      );
    });

    it("应该添加部门", () => {
      aggregate.addDepartment(department);

      expect(aggregate.getDepartments()).toContain(department);
      expect(aggregate.getDepartmentCount()).toBe(1);
      expect(aggregate.hasDepartments()).toBe(true);
    });

    it("应该移除部门", () => {
      aggregate.addDepartment(department);
      aggregate.removeDepartment(department.id);

      expect(aggregate.getDepartments()).not.toContain(department);
      expect(aggregate.getDepartmentCount()).toBe(0);
      expect(aggregate.hasDepartments()).toBe(false);
    });

    it("应该防止重复添加同名部门", () => {
      aggregate.addDepartment(department);

      const duplicateDepartment = new Department(
        TenantId.create("550e8400-e29b-41d4-a716-446655440005"),
        {
          name: "test-department", // 同名
          description: "Duplicate department",
          level: DepartmentLevel.create(1),
          organizationId: validOrganization.id,
          parentId: undefined,
          managerId: undefined,
          path: "/test-organization/duplicate-department",
          sortOrder: 2,
          isActive: true,
        },
        validAuditInfo,
      );

      expect(() => {
        aggregate.addDepartment(duplicateDepartment);
      }).toThrow("部门名称在同一组织内必须唯一");
    });

    it("应该验证部门层级不能超过8层", () => {
      const invalidDepartment = new Department(
        TenantId.create("550e8400-e29b-41d4-a716-446655440006"),
        {
          name: "invalid-department",
          description: "Invalid department",
          level: DepartmentLevel.create(9), // 超过8层
          organizationId: validOrganization.id,
          parentId: undefined,
          managerId: undefined,
          path: "/test-organization/invalid-department",
          sortOrder: 1,
          isActive: true,
        },
        validAuditInfo,
      );

      expect(() => {
        aggregate.addDepartment(invalidDepartment);
      }).toThrow("部门层级不能超过8层");
    });
  });

  describe("验证规则", () => {
    let aggregate: OrganizationAggregate;

    beforeEach(() => {
      aggregate = new OrganizationAggregate(
        validEntityId,
        validOrganization,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该验证组织名称不能为空", () => {
      expect(() => {
        aggregate.renameOrganization("");
      }).toThrow("组织名称不能为空");
    });

    it("应该验证组织名称长度", () => {
      const longName = "a".repeat(101);
      expect(() => {
        aggregate.renameOrganization(longName);
      }).toThrow("组织名称长度不能超过100个字符");
    });
  });

  describe("性能测试", () => {
    it("应该处理大量部门", () => {
      const aggregate = new OrganizationAggregate(
        validEntityId,
        validOrganization,
        validAuditInfo,
        mockLogger,
      );

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const department = new Department(
          TenantId.create(
            `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          ),
          {
            name: `department-${i}`,
            description: `Department ${i}`,
            level: DepartmentLevel.create(1),
            organizationId: validOrganization.id,
            parentId: undefined,
            managerId: undefined,
            path: `/test-organization/department-${i}`,
            sortOrder: i,
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.addDepartment(department);
      }
      const endTime = Date.now();

      expect(aggregate.getDepartmentCount()).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
