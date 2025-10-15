# 测试规范标准

本文档详细说明 HL8 SAAS Platform 项目的测试架构和实施标准。

## 目录

- [测试架构原则](#测试架构原则)
- [测试类型](#测试类型)
- [测试文件组织](#测试文件组织)
- [测试命名规范](#测试命名规范)
- [测试编写指南](#测试编写指南)
- [测试覆盖率要求](#测试覆盖率要求)
- [测试工具和框架](#测试工具和框架)
- [最佳实践](#最佳实践)

## 测试架构原则

### 1. 就近原则

**定义**：单元测试文件必须与被测试文件在同一目录下。

**文件命名规范**：

```text
src/
├── features/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts    ← 单元测试
│   └── users/
│       ├── users.controller.ts
│       └── users.controller.spec.ts ← 单元测试
```

**优势**：

- 便于维护和快速定位
- 测试与代码同步更新
- 降低认知负担

### 2. 集中管理

**定义**：集成测试和端到端测试统一放置在项目根目录的 `__tests__` 目录下。

**目录结构**：

```text
__tests__/
├── integration/           # 集成测试
│   ├── auth/
│   │   └── auth-flow.integration.spec.ts
│   └── users/
│       └── user-management.integration.spec.ts
└── e2e/                  # 端到端测试
    ├── auth/
    │   └── login-flow.e2e.spec.ts
    └── users/
        └── user-profile.e2e.spec.ts
```

**优势**：

- 便于统一管理和执行
- 清晰的测试类型划分
- 易于配置不同的测试环境

### 3. 类型分离

**单元测试（Unit Tests）**：

- 位置：与源代码同目录
- 范围：单个函数、类或组件
- 依赖：使用 Mock/Stub 隔离外部依赖
- 执行速度：毫秒级

**集成测试（Integration Tests）**：

- 位置：`__tests__/integration/`
- 范围：多个模块之间的交互
- 依赖：使用真实的依赖或测试替身
- 执行速度：秒级

**端到端测试（E2E Tests）**：

- 位置：`__tests__/e2e/`
- 范围：完整的用户流程
- 依赖：真实环境或接近真实的测试环境
- 执行速度：分钟级

### 4. 依赖隔离

**原则**：

- 每个测试用例必须独立运行
- 测试之间不能共享可变状态
- 使用 `beforeEach` 和 `afterEach` 清理状态

**示例**：

```typescript
describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // 每个测试前重新创建实例
    mockUserRepository = createMockUserRepository();
    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    // 清理状态
    jest.clearAllMocks();
  });

  it("should register a new user", async () => {
    // 测试逻辑
  });

  it("should throw error for duplicate email", async () => {
    // 测试逻辑
  });
});
```

### 5. 快速反馈

**测试执行速度要求**：

- **单元测试**：每个测试 < 10ms
- **集成测试**：每个测试 < 1s
- **端到端测试**：每个测试 < 30s

**优化策略**：

- 使用并行测试执行
- 合理使用测试替身（Mock/Stub）
- 避免不必要的异步操作
- 使用内存数据库进行数据库测试

## 测试类型

### 单元测试（Unit Tests）

**目标**：测试单个函数、类或组件的行为。

**特点**：

- 快速执行
- 高度隔离
- 易于调试
- 覆盖率高

**适用场景**：

- 纯函数和工具函数
- 服务类的业务逻辑
- 数据转换和验证
- 算法和计算逻辑

**示例**：

```typescript
// src/utils/password.ts
export function validatePassword(password: string): boolean {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  );
}

// src/utils/password.spec.ts
describe("validatePassword", () => {
  it("should return true for valid password", () => {
    expect(validatePassword("Password123")).toBe(true);
  });

  it("should return false for short password", () => {
    expect(validatePassword("Pass1")).toBe(false);
  });

  it("should return false for password without uppercase", () => {
    expect(validatePassword("password123")).toBe(false);
  });

  it("should return false for password without number", () => {
    expect(validatePassword("Password")).toBe(false);
  });
});
```

### 集成测试（Integration Tests）

**目标**：测试多个模块之间的交互和集成。

**特点**：

- 测试真实的依赖关系
- 验证模块间的契约
- 覆盖关键路径

**适用场景**：

- 数据库操作
- API 端点测试
- 外部服务集成
- 模块间通信

**示例**：

```typescript
// __tests__/integration/auth/auth-flow.integration.spec.ts
describe("Authentication Flow", () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    // 初始化测试应用
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // 清理数据库
    await userRepository.clear();
  });

  it("should register and login user", async () => {
    // 1. 注册用户
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "Password123",
        name: "Test User",
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty("id");

    // 2. 登录用户
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123",
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty("accessToken");
    expect(loginResponse.body).toHaveProperty("refreshToken");
  });
});
```

### 端到端测试（E2E Tests）

**目标**：从用户角度测试完整的业务流程。

**特点**：

- 模拟真实用户操作
- 测试完整流程
- 覆盖关键业务场景

**适用场景**：

- 用户注册登录流程
- 关键业务流程
- 跨模块的复杂流程

**示例**：

```typescript
// __tests__/e2e/auth/complete-auth-flow.e2e.spec.ts
describe("Complete Authentication Flow (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should complete full authentication flow", async () => {
    const email = `test-${Date.now()}@example.com`;

    // 1. 用户注册
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email,
        password: "Password123",
        name: "Test User",
      })
      .expect(201);

    // 2. 邮箱确认（模拟）
    const confirmToken = registerResponse.body.confirmToken;
    await request(app.getHttpServer())
      .post("/auth/confirm-email")
      .send({ token: confirmToken })
      .expect(200);

    // 3. 用户登录
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email,
        password: "Password123",
      })
      .expect(200);

    const accessToken = loginResponse.body.accessToken;

    // 4. 访问受保护资源
    await request(app.getHttpServer())
      .get("/users/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    // 5. 修改密码
    await request(app.getHttpServer())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Password123",
        newPassword: "NewPassword456",
      })
      .expect(200);

    // 6. 使用新密码登录
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email,
        password: "NewPassword456",
      })
      .expect(200);
  });
});
```

## 测试文件组织

### NestJS 后端项目

```text
apps/api/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.controller.spec.ts      ← 单元测试
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.spec.ts         ← 单元测试
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.controller.spec.ts     ← 单元测试
│   │       ├── users.service.ts
│   │       └── users.service.spec.ts        ← 单元测试
│   └── common/
│       └── utils/
│           ├── password.ts
│           └── password.spec.ts             ← 单元测试
├── __tests__/
│   ├── integration/                         ← 集成测试
│   │   ├── auth/
│   │   │   └── auth-flow.integration.spec.ts
│   │   └── users/
│   │       └── user-crud.integration.spec.ts
│   └── e2e/                                 ← 端到端测试
│       └── auth/
│           └── complete-flow.e2e.spec.ts
└── jest.config.ts
```

### Next.js 前端项目

```text
apps/web/
├── app/
│   ├── (home)/
│   │   ├── page.tsx
│   │   └── page.test.tsx                    ← 单元测试
│   └── auth/
│       ├── sign-in/
│       │   ├── page.tsx
│       │   └── page.test.tsx                ← 单元测试
│       └── sign-up/
│           ├── page.tsx
│           └── page.test.tsx                ← 单元测试
├── components/
│   ├── auth/
│   │   ├── form/
│   │   │   ├── sign-in.form.tsx
│   │   │   └── sign-in.form.test.tsx        ← 单元测试
│   │   └── session/
│   │       ├── session.tsx
│   │       └── session.test.tsx             ← 单元测试
├── lib/
│   ├── utils.ts
│   └── utils.test.ts                        ← 单元测试
├── __tests__/
│   ├── integration/                         ← 集成测试
│   │   └── auth/
│   │       └── auth-api.integration.test.tsx
│   └── e2e/                                 ← 端到端测试
│       └── auth/
│           └── login-flow.e2e.test.tsx
└── vitest.config.mts
```

## 测试命名规范

### 文件命名

**单元测试**：

- 后端：`{被测试文件名}.spec.ts`
- 前端：`{被测试文件名}.test.tsx` 或 `{被测试文件名}.test.ts`

**集成测试**：

- `{模块名}.integration.spec.ts` 或 `{模块名}.integration.test.tsx`

**端到端测试**：

- `{流程名}.e2e.spec.ts` 或 `{流程名}.e2e.test.tsx`

### 测试套件命名

使用 `describe` 块组织测试，命名应清晰描述被测试的单元：

```typescript
// 类或服务
describe('AuthService', () => { ... });

// 函数
describe('validatePassword', () => { ... });

// 组件
describe('SignInForm', () => { ... });

// API 端点
describe('POST /auth/login', () => { ... });
```

### 测试用例命名

使用 `it` 或 `test` 描述具体的测试场景，遵循 "should + 动词 + 预期结果" 模式：

```typescript
it('should return true for valid password', () => { ... });
it('should throw error when email is duplicate', () => { ... });
it('should render login form correctly', () => { ... });
it('should redirect to home after successful login', () => { ... });
```

## 测试编写指南

### AAA 模式（Arrange-Act-Assert）

所有测试应遵循 AAA 模式：

```typescript
it("should register a new user", async () => {
  // Arrange（准备）：设置测试数据和依赖
  const registerDto = {
    email: "test@example.com",
    password: "Password123",
    name: "Test User",
  };
  mockUserRepository.findOne.mockResolvedValue(null);
  mockUserRepository.save.mockResolvedValue({ id: "1", ...registerDto });

  // Act（执行）：调用被测试的方法
  const result = await authService.register(registerDto);

  // Assert（断言）：验证结果
  expect(result).toHaveProperty("id");
  expect(result.email).toBe(registerDto.email);
  expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
});
```

### 测试替身（Test Doubles）

**Mock**：模拟对象，可以验证调用和设置返回值

```typescript
const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
```

**Stub**：返回预定义响应的简单实现

```typescript
const stubEmailService = {
  sendEmail: () => Promise.resolve(),
};
```

**Spy**：监视真实对象的方法调用

```typescript
const emailService = new EmailService();
jest.spyOn(emailService, "sendEmail");
```

### 边界条件测试

确保测试覆盖边界条件：

```typescript
describe("validateAge", () => {
  it("should return true for age 18", () => {
    expect(validateAge(18)).toBe(true);
  });

  it("should return false for age 17", () => {
    expect(validateAge(17)).toBe(false);
  });

  it("should return false for negative age", () => {
    expect(validateAge(-1)).toBe(false);
  });

  it("should return false for age 0", () => {
    expect(validateAge(0)).toBe(false);
  });
});
```

### 异常测试

测试异常情况和错误处理：

```typescript
it("should throw error when user not found", async () => {
  mockUserRepository.findOne.mockResolvedValue(null);

  await expect(
    authService.login("nonexistent@example.com", "password"),
  ).rejects.toThrow("User not found");
});

it("should throw error for invalid password", async () => {
  const user = { email: "test@example.com", password: "hashedPassword" };
  mockUserRepository.findOne.mockResolvedValue(user);
  mockPasswordService.compare.mockResolvedValue(false);

  await expect(
    authService.login("test@example.com", "wrongPassword"),
  ).rejects.toThrow("Invalid password");
});
```

## 测试覆盖率要求

### 覆盖率指标

- **核心业务逻辑**：≥ 80% 覆盖率
- **关键路径**：≥ 90% 覆盖率
- **公共 API**：100% 覆盖率
- **工具函数**：≥ 85% 覆盖率

### 覆盖率类型

**语句覆盖率（Statement Coverage）**：

- 每一行代码至少执行一次

**分支覆盖率（Branch Coverage）**：

- 每个条件分支都被测试

**函数覆盖率（Function Coverage）**：

- 每个函数至少被调用一次

**行覆盖率（Line Coverage）**：

- 代码行的执行情况

### 查看覆盖率报告

**后端（NestJS + Jest）**：

```bash
cd apps/api
pnpm test:cov
```

**前端（Next.js + Vitest）**：

```bash
cd apps/web
pnpm test:coverage
```

### 覆盖率配置

**Jest 配置示例**：

```javascript
// jest.config.ts
export default {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/features/**/": {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## 测试工具和框架

### 后端（NestJS）

**测试框架**：

- Jest：单元测试和集成测试
- Supertest：HTTP 端点测试

**配置文件**：

- `jest.config.ts`：Jest 配置
- `test/jest-e2e.json`：E2E 测试配置

**常用命令**：

```bash
# 运行所有测试
pnpm test

# 运行单元测试（监听模式）
pnpm test:watch

# 运行 E2E 测试
pnpm test:e2e

# 生成覆盖率报告
pnpm test:cov
```

### 前端（Next.js）

**测试框架**：

- Vitest：单元测试和集成测试
- Testing Library：组件测试

**配置文件**：

- `vitest.config.mts`：Vitest 配置

**常用命令**：

```bash
# 运行所有测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 最佳实践

### 1. 保持测试简单

- 一个测试只验证一个行为
- 避免复杂的测试逻辑
- 使用清晰的变量命名

### 2. 避免测试实现细节

```typescript
// ❌ 不好：测试实现细节
it("should call fetchUser and then fetchProfile", () => {
  const spy1 = jest.spyOn(service, "fetchUser");
  const spy2 = jest.spyOn(service, "fetchProfile");

  service.getUserProfile("1");

  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
});

// ✅ 好：测试行为和结果
it("should return user profile with email and name", async () => {
  const profile = await service.getUserProfile("1");

  expect(profile).toHaveProperty("email");
  expect(profile).toHaveProperty("name");
});
```

### 3. 使用有意义的测试数据

```typescript
// ❌ 不好：无意义的测试数据
const user = { email: "a@b.c", password: "123" };

// ✅ 好：有意义的测试数据
const user = {
  email: "john.doe@example.com",
  password: "SecurePassword123",
  name: "John Doe",
};
```

### 4. 避免测试间的依赖

```typescript
// ❌ 不好：测试间有依赖
let userId: string;

it("should create user", async () => {
  const user = await service.createUser(userData);
  userId = user.id; // 共享状态
});

it("should get user by id", async () => {
  const user = await service.getUserById(userId); // 依赖上一个测试
  expect(user).toBeDefined();
});

// ✅ 好：每个测试独立
it("should create user", async () => {
  const user = await service.createUser(userData);
  expect(user).toHaveProperty("id");
});

it("should get user by id", async () => {
  const createdUser = await service.createUser(userData);
  const user = await service.getUserById(createdUser.id);
  expect(user).toBeDefined();
});
```

### 5. 使用测试辅助函数

```typescript
// 创建测试辅助函数
function createMockUser(overrides = {}) {
  return {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword",
    ...overrides,
  };
}

// 在测试中使用
it("should update user email", async () => {
  const user = createMockUser({ email: "old@example.com" });
  mockRepository.findOne.mockResolvedValue(user);

  const result = await service.updateEmail(user.id, "new@example.com");

  expect(result.email).toBe("new@example.com");
});
```

### 6. 使用 beforeEach 进行初始化

```typescript
describe("AuthService", () => {
  let service: AuthService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new AuthService(mockRepository);
  });

  // 测试用例...
});
```

### 7. 测试异步代码

```typescript
// ✅ 使用 async/await
it("should register user", async () => {
  const result = await service.register(userData);
  expect(result).toHaveProperty("id");
});

// ✅ 使用 Promise
it("should register user", () => {
  return service.register(userData).then((result) => {
    expect(result).toHaveProperty("id");
  });
});
```

### 8. 合理使用快照测试

```typescript
// 适合使用快照的场景：UI 组件结构
it('should render correctly', () => {
  const { container } = render(<SignInForm />);
  expect(container).toMatchSnapshot();
});

// 不适合使用快照的场景：业务逻辑
// ❌ 避免对复杂对象使用快照
it('should return user data', async () => {
  const user = await service.getUser('1');
  expect(user).toMatchSnapshot(); // 脆弱且难以维护
});

// ✅ 明确验证关键属性
it('should return user data', async () => {
  const user = await service.getUser('1');
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user.email).toBe('test@example.com');
});
```

## 持续改进

### 定期审查测试

- 每月审查测试覆盖率
- 识别测试盲点
- 重构脆弱的测试

### 测试性能优化

- 使用并行测试执行
- 优化慢速测试
- 合理使用测试替身

### 文档更新

- 及时更新测试文档
- 分享测试最佳实践
- 记录常见问题和解决方案

---

**最后更新**: 2025-10-10  
**版本**: 1.0.0  
**维护者**: HL8 SAAS Platform Team
