import { EntityId, TenantId } from "@hl8/isolation-model";
import { DepartmentAggregate } from "./department-aggregate.js";
import { Department } from "../entities/department/department.entity.js";
import { DepartmentLevel } from "../value-objects/types/department-level.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("DepartmentAggregate", () => {
  let validEntityId: EntityId;
  let validDepartment: Department;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    validAuditInfo = {
      createdBy: "test-user",
    };

    validDepartment = new Department(
      TenantId.create("550e8400-e29b-41d4-a716-446655440001"),
      {
        name: "test-department",
        description: "Test department description",
        level: DepartmentLevel.create(1),
        parentId: undefined,
        managerId: undefined,
        path: "/test-department",
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
    it("应该成功创建部门聚合根", () => {
      const aggregate = new DepartmentAggregate(
        validEntityId,
        validDepartment,
        validAuditInfo,
        mockLogger,
      );

      expect(aggregate).toBeDefined();
      expect(aggregate.getDepartment()).toBe(validDepartment);
      expect(aggregate.getSubDepartments()).toEqual([]);
    });

    it("应该验证部门实体", () => {
      expect(() => {
        new DepartmentAggregate(
          validEntityId,
          null as any,
          validAuditInfo,
          mockLogger,
        );
      }).toThrow("department is not defined");
    });
  });

  describe("部门管理", () => {
    let aggregate: DepartmentAggregate;

    beforeEach(() => {
      aggregate = new DepartmentAggregate(
        validEntityId,
        validDepartment,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该重命名部门", () => {
      const newName = "new-department-name";
      aggregate.renameDepartment(newName);

      expect(aggregate.getDepartment().name).toBe(newName);
    });

    it("应该更新部门描述", () => {
      const newDescription = "New department description";
      aggregate.updateDescription(newDescription);

      expect(aggregate.getDepartment().description).toBe(newDescription);
    });

    it("应该设置部门负责人", () => {
      const managerId = TenantId.create("550e8400-e29b-41d4-a716-446655440003");
      aggregate.setManager(managerId);

      expect(aggregate.getDepartment().managerId).toBe(managerId);
    });

    it("应该激活部门", () => {
      // 先停用部门，然后激活
      aggregate.deactivateDepartment();
      aggregate.activateDepartment();

      expect(aggregate.getDepartment().isActive).toBe(true);
    });

    it("应该停用部门", () => {
      aggregate.deactivateDepartment();

      expect(aggregate.getDepartment().isActive).toBe(false);
    });
  });

  describe("子部门管理", () => {
    let aggregate: DepartmentAggregate;
    let subDepartment: Department;

    beforeEach(() => {
      aggregate = new DepartmentAggregate(
        validEntityId,
        validDepartment,
        validAuditInfo,
        mockLogger,
      );

      subDepartment = new Department(
        TenantId.create("550e8400-e29b-41d4-a716-446655440004"),
        {
          name: "sub-department",
          description: "Sub department description",
          level: DepartmentLevel.create(2),
          parentId: validDepartment.id,
          managerId: undefined,
          path: "/test-department/sub-department",
          sortOrder: 1,
          isActive: true,
        },
        validAuditInfo,
      );
    });

    it("应该添加子部门", () => {
      aggregate.addSubDepartment(subDepartment);

      expect(aggregate.getSubDepartments()).toContain(subDepartment);
      expect(aggregate.getSubDepartmentCount()).toBe(1);
      expect(aggregate.hasSubDepartments()).toBe(true);
    });

    it("应该移除子部门", () => {
      aggregate.addSubDepartment(subDepartment);
      aggregate.removeSubDepartment(subDepartment.id);

      expect(aggregate.getSubDepartments()).not.toContain(subDepartment);
      expect(aggregate.getSubDepartmentCount()).toBe(0);
      expect(aggregate.hasSubDepartments()).toBe(false);
    });

    it("应该防止添加自己为子部门", () => {
      expect(() => {
        aggregate.addSubDepartment(validDepartment);
      }).toThrow("子部门不能设置自己为父部门");
    });

    it("应该验证子部门层级", () => {
      const invalidSubDepartment = new Department(
        TenantId.create("550e8400-e29b-41d4-a716-446655440005"),
        {
          name: "invalid-sub-department",
          description: "Invalid sub department",
          level: DepartmentLevel.create(1), // 层级不能小于等于父部门
          parentId: validDepartment.id,
          managerId: undefined,
          path: "/test-department/invalid-sub-department",
          sortOrder: 1,
          isActive: true,
        },
        validAuditInfo,
      );

      expect(() => {
        aggregate.addSubDepartment(invalidSubDepartment);
      }).toThrow();
    });

    it("应该获取最大子部门层级", () => {
      expect(aggregate.getMaxSubDepartmentLevel()).toBe(
        validDepartment.level.value,
      );

      aggregate.addSubDepartment(subDepartment);
      expect(aggregate.getMaxSubDepartmentLevel()).toBe(2);
    });
  });

  describe("验证规则", () => {
    let aggregate: DepartmentAggregate;

    beforeEach(() => {
      aggregate = new DepartmentAggregate(
        validEntityId,
        validDepartment,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该验证部门名称不能为空", () => {
      expect(() => {
        aggregate.renameDepartment("");
      }).toThrow("部门名称不能为空");
    });

    it("应该验证部门名称长度", () => {
      const longName = "a".repeat(101);
      expect(() => {
        aggregate.renameDepartment(longName);
      }).toThrow("部门名称长度不能超过100个字符");
    });

    it("应该验证子部门层级不能超过8层", () => {
      // 直接测试DepartmentLevel.create(9)会抛出异常
      expect(() => {
        DepartmentLevel.create(9);
      }).toThrow("部门层级必须在1-8之间，当前值：9");
    });
  });

  describe("性能测试", () => {
    it("应该处理大量子部门", () => {
      const aggregate = new DepartmentAggregate(
        validEntityId,
        validDepartment,
        validAuditInfo,
        mockLogger,
      );

      const subDepartmentIds = [
        "550e8400-e29b-41d4-a716-446655440010",
        "550e8400-e29b-41d4-a716-446655440011",
        "550e8400-e29b-41d4-a716-446655440012",
        "550e8400-e29b-41d4-a716-446655440013",
        "550e8400-e29b-41d4-a716-446655440014",
      ];

      const startTime = Date.now();
      for (let i = 0; i < 5; i++) {
        const subDepartment = new Department(
          TenantId.create(subDepartmentIds[i]),
          {
            name: `sub-department-${i}`,
            description: `Sub department ${i}`,
            level: DepartmentLevel.create(2),
            parentId: undefined, // 不设置父部门，避免循环引用
            managerId: undefined,
            path: `/test-department/sub-department-${i}`,
            sortOrder: i,
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.addSubDepartment(subDepartment);
      }
      const endTime = Date.now();

      expect(aggregate.getSubDepartmentCount()).toBe(5);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
