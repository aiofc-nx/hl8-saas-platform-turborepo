import { EntityId } from "@hl8/isolation-model";
import { PathCalculationService } from "./path-calculation.service.js";
import { IPureLogger } from "@hl8/pure-logger";
import { DomainValidationException } from "../exceptions/validation-exceptions.js";

describe("PathCalculationService", () => {
  let pathService: PathCalculationService;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    pathService = new PathCalculationService(mockLogger);
  });

  describe("构造函数", () => {
    it("应该成功创建路径计算服务", () => {
      expect(pathService).toBeDefined();
      expect(pathService).toBeInstanceOf(PathCalculationService);
    });
  });

  describe("计算部门路径", () => {
    it("应该为根部门计算正确的路径", () => {
      const departmentId = EntityId.generate();
      const path = pathService.calculateDepartmentPath(
        departmentId,
        undefined,
        undefined,
      );

      expect(path).toBe(`/${departmentId.toString()}`);
    });

    it("应该为子部门计算正确的路径", () => {
      const departmentId = EntityId.generate();
      const parentId = EntityId.generate();
      const parentPath = `/${parentId.toString()}`;

      const path = pathService.calculateDepartmentPath(
        departmentId,
        parentId,
        parentPath,
      );

      expect(path).toBe(`/${parentId.toString()}/${departmentId.toString()}`);
    });

    it("应该为多层嵌套部门计算正确的路径", () => {
      const departmentId = EntityId.generate();
      const parentId = EntityId.generate();
      const grandParentId = EntityId.generate();
      const parentPath = `/${grandParentId.toString()}/${parentId.toString()}`;

      const path = pathService.calculateDepartmentPath(
        departmentId,
        parentId,
        parentPath,
      );

      expect(path).toBe(
        `/${grandParentId.toString()}/${parentId.toString()}/${departmentId.toString()}`,
      );
    });
  });

  describe("计算组织路径", () => {
    it("应该为根组织计算正确的路径", () => {
      const organizationId = EntityId.generate();
      const path = pathService.calculateOrganizationPath(
        organizationId,
        undefined,
        undefined,
      );

      expect(path).toBe(`/${organizationId.toString()}`);
    });

    it("应该为子组织计算正确的路径", () => {
      const organizationId = EntityId.generate();
      const parentId = EntityId.generate();
      const parentPath = `/${parentId.toString()}`;

      const path = pathService.calculateOrganizationPath(
        organizationId,
        parentId,
        parentPath,
      );

      expect(path).toBe(`/${parentId.toString()}/${organizationId.toString()}`);
    });
  });

  describe("路径验证", () => {
    it("应该验证有效的路径", () => {
      const validPath = "/123/456/789";
      expect(() => pathService.validatePath(validPath)).not.toThrow();
    });

    it("应该验证根路径", () => {
      const rootPath = "/123";
      expect(() => pathService.validatePath(rootPath)).not.toThrow();
    });

    it("应该在路径为空时抛出异常", () => {
      expect(() => pathService.validatePath("")).toThrow(
        DomainValidationException,
      );
      expect(() => pathService.validatePath("   ")).toThrow(
        DomainValidationException,
      );
    });

    it("应该在路径格式无效时抛出异常", () => {
      expect(() => pathService.validatePath("invalid-path")).toThrow(
        DomainValidationException,
      );
      expect(() => pathService.validatePath("123/456")).toThrow(
        DomainValidationException,
      );
    });

    it("应该检测循环引用", () => {
      const circularPath = "/123/456/123";
      expect(() => pathService.validatePath(circularPath)).toThrow(
        "路径包含循环引用",
      );
    });

    it("应该检测深层循环引用", () => {
      const deepCircularPath = "/123/456/789/456";
      expect(() => pathService.validatePath(deepCircularPath)).toThrow(
        "路径包含循环引用",
      );
    });
  });

  describe("路径解析", () => {
    it("应该正确解析路径为ID数组", () => {
      const path = "/123/456/789";
      const ids = pathService.parsePathToIds(path);

      expect(ids).toHaveLength(3);
      expect(ids[0]).toBe("123");
      expect(ids[1]).toBe("456");
      expect(ids[2]).toBe("789");
    });

    it("应该正确解析根路径", () => {
      const path = "/123";
      const ids = pathService.parsePathToIds(path);

      expect(ids).toHaveLength(1);
      expect(ids[0]).toBe("123");
    });

    it("应该处理空路径", () => {
      const ids = pathService.parsePathToIds("");
      expect(ids).toHaveLength(0);
    });
  });

  describe("路径操作", () => {
    it("应该正确获取父路径", () => {
      const path = "/123/456/789";
      const parentPath = pathService.getParentPath(path);

      expect(parentPath).toBe("/123/456");
    });

    it("应该正确获取根路径的父路径", () => {
      const path = "/123";
      const parentPath = pathService.getParentPath(path);

      expect(parentPath).toBeUndefined();
    });

    it("应该正确获取路径深度", () => {
      const path1 = "/123";
      const path2 = "/123/456";
      const path3 = "/123/456/789";

      expect(pathService.getPathDepth(path1)).toBe(1);
      expect(pathService.getPathDepth(path2)).toBe(2);
      expect(pathService.getPathDepth(path3)).toBe(3);
    });

    it("应该正确检查是否为根路径", () => {
      const rootPath = "/123";
      const childPath = "/123/456";

      expect(pathService.isRootPath(rootPath)).toBe(true);
      expect(pathService.isRootPath(childPath)).toBe(false);
    });

    it("应该正确检查路径包含关系", () => {
      const parentPath = "/123/456";
      const childPath = "/123/456/789";

      expect(pathService.isAncestorPath(parentPath, childPath)).toBe(true);
      expect(pathService.isAncestorPath(childPath, parentPath)).toBe(false);
    });
  });

  describe("路径更新", () => {
    it("应该正确更新子路径", () => {
      const oldParentPath = "/123/456";
      const newParentPath = "/123/789";
      const childPath = "/123/456/child";

      const updatedPath = pathService.updateChildPath(
        childPath,
        oldParentPath,
        newParentPath,
      );

      expect(updatedPath).toBe("/123/789/child");
    });

    it("应该正确处理根路径更新", () => {
      const oldParentPath = "/123";
      const newParentPath = "/456";
      const childPath = "/123/child";

      const updatedPath = pathService.updateChildPath(
        childPath,
        oldParentPath,
        newParentPath,
      );

      expect(updatedPath).toBe("/456/child");
    });
  });

  describe("边界情况", () => {
    it("应该处理单字符ID", () => {
      const path = "/a/b/c";
      expect(() => pathService.validatePath(path)).not.toThrow();
    });

    it("应该处理长ID", () => {
      const longId = "a".repeat(50);
      const path = `/${longId}`;
      expect(() => pathService.validatePath(path)).not.toThrow();
    });

    it("应该处理特殊字符ID", () => {
      const specialId = "123-456_789";
      const path = `/${specialId}`;
      expect(() => pathService.validatePath(path)).not.toThrow();
    });
  });

  describe("日志记录", () => {
    it("应该记录路径计算操作", () => {
      const departmentId = EntityId.generate();
      pathService.calculateDepartmentPath(departmentId, undefined, undefined);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        "计算部门路径",
        expect.objectContaining({
          departmentId: departmentId.toString(),
        }),
      );
    });

    it("应该记录路径验证操作", () => {
      const path = "/123/456";
      pathService.validatePath(path);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        "验证路径",
        expect.objectContaining({
          path,
        }),
      );
    });
  });
});
