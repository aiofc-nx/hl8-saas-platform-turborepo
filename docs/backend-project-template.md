# 后端项目库基本结构与配置标准

本文档定义 HL8 SAAS Platform 中所有后端项目库的统一结构和配置标准。

**目标**：确保所有后端项目（apps/ 和 libs/ 下的 NestJS 项目）遵循相同的配置和脚本规范，提高一致性和可维护性。

**依据**：项目宪章（Constitution v1.4.2）

## 适用范围

本标准适用于以下类型的项目：

- **应用项目**（apps/）：可独立运行的 NestJS 应用
  - 示例：`apps/api`、`apps/fastify-api`

- **库项目**（libs/）：服务端共享库和领域模块
  - 示例：`libs/logger`、`libs/nestjs-enhance`

## Clean Architecture 核心原则

根据项目宪章 III. 架构原则，所有后端项目必须遵循 Clean Architecture 分层架构：

### 四层架构（Clean Architecture + CQRS + ES + EDA）

```
┌──────────────────────────────────────────────────────────┐
│           Interface（接口层）- 最外层                      │
│  HTTP (Controllers, DTOs, Guards, Interceptors)          │
│  GraphQL (Resolvers, Schemas)                            │
│  Messaging (Listeners)                                   │
├──────────────────────────────────────────────────────────┤
│       Infrastructure（基础设施层）- 外层                  │
│  Adapters: Repositories, Event Store, Message Queue      │
│  Event Sourcing: Event Store, Snapshots                  │
│  Event Driven: Event Bus, Publishers, Subscribers        │
│  Persistence, Mappers, Factories, Performance            │
├──────────────────────────────────────────────────────────┤
│         Application（应用层）- 中层                       │
│  ★ Use Cases (核心 - 描述系统能力)                       │
│  CQRS: Commands, Queries, Event Store, Sagas            │
│  Services, Ports, Interfaces, Common                     │
├──────────────────────────────────────────────────────────┤
│           Domain（领域层）- 最内层                        │
│  DDD: Aggregates, Entities, Value Objects, Events        │
│  Repositories (接口), Services, Specifications, Rules     │
│  Security, Validation, Types, Exceptions                 │
└──────────────────────────────────────────────────────────┘
```

**架构模式集成说明**：

- **Clean Architecture**：四层架构，依赖从外向内
- **DDD**：领域层采用 DDD 战术设计（实体、聚合根、值对象、领域服务等）
- **CQRS**：命令和查询分离，支持读写模型分离
- **事件溯源（ES）**：所有状态变更通过事件记录，支持重放和审计
- **事件驱动（EDA）**：系统通过事件通信，实现解耦
- **六边形架构**：通过 ports 和 adapters 实现技术无关性

### 依赖规则（从外向内）

```
Interfaces → Application → Domain
     ↓            ↓
Infrastructure →  ↗
```

- **接口层**：依赖应用层，调用用例
- **应用层**：依赖领域层，协调领域对象
- **基础设施层**：依赖领域层，实现领域接口
- **领域层**：不依赖任何层，纯粹的业务逻辑

### 用例的核心地位

**用例（Use Cases）是应用层的核心**，原因：

1. **描述系统能力**：每个用例代表系统的一个具体业务能力
2. **业务流程封装**：用例封装完整的业务流程
3. **协调领域对象**：用例协调多个领域对象完成业务目标
4. **技术无关**：用例描述业务逻辑，不涉及技术实现细节
5. **可测试性**：用例边界清晰，易于编写测试

### 用例与命令/查询的关系

- **用例（Use Cases）**：Clean Architecture 的核心概念
- **命令（Commands）**：CQRS 模式中的写操作，是用例的一种实现方式
- **查询（Queries）**：CQRS 模式中的读操作，是用例的一种实现方式

**示例**：

```typescript
// 用例：创建用户（业务流程）
class CreateUserUseCase {
  execute(userData: UserData): Promise<User> {
    // 1. 验证业务规则
    // 2. 创建领域对象
    // 3. 调用仓储保存
    // 4. 发布领域事件
  }
}

// 命令：创建用户命令（CQRS 实现）
class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string
  ) {}
}

class CreateUserCommandHandler {
  execute(command: CreateUserCommand): Promise<User> {
    // 调用 CreateUserUseCase 或直接实现用例逻辑
  }
}
```

## 项目结构模板

### 应用项目结构（apps/*）

```
apps/my-service/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── app.module.ts              # 根模块
│   │
│   ├── domain/                    # 领域层（Clean Architecture + DDD）
│   │   ├── aggregates/            # 聚合根（DDD）
│   │   ├── entities/              # 实体（DDD）
│   │   ├── value-objects/         # 值对象（DDD）
│   │   ├── events/                # 领域事件（DDD + EDA）
│   │   ├── repositories/          # 仓储接口（DDD）
│   │   ├── services/              # 领域服务（DDD）
│   │   ├── specifications/        # 规格模式（DDD）
│   │   ├── rules/                 # 业务规则
│   │   ├── security/              # 安全策略
│   │   ├── validation/            # 验证逻辑
│   │   ├── validators/            # 验证器
│   │   ├── types/                 # 领域类型定义
│   │   └── exceptions/            # 领域异常
│   │
│   ├── application/               # 应用层（用例 + CQRS）
│   │   ├── use-cases/             # 用例（核心，描述系统能力）
│   │   ├── cqrs/                  # CQRS 模式实现
│   │   │   ├── bus/               # 命令/查询/事件总线
│   │   │   ├── commands/          # 命令定义
│   │   │   │   └── handlers/      # 命令处理器
│   │   │   ├── queries/           # 查询定义
│   │   │   │   └── handlers/      # 查询处理器
│   │   │   ├── events/            # 应用事件
│   │   │   │   ├── handlers/      # 事件处理器
│   │   │   │   └── projectors/    # 事件投影器（读模型）
│   │   │   ├── event-store/       # 事件存储（ES）
│   │   │   └── sagas/             # Saga 模式（长事务）
│   │   ├── services/              # 应用服务
│   │   ├── ports/                 # 端口接口（六边形架构）
│   │   ├── interfaces/            # 应用接口定义
│   │   ├── exceptions/            # 应用异常
│   │   ├── explorers/             # 探索器（元数据发现）
│   │   └── common/                # 应用层通用组件
│   │       ├── exceptions/        # 通用异常
│   │       ├── interfaces/        # 通用接口
│   │       └── middleware/        # 中间件
│   │
│   ├── infrastructure/            # 基础设施层
│   │   ├── adapters/              # 适配器（六边形架构）
│   │   │   ├── repositories/      # 仓储实现
│   │   │   ├── event-store/       # 事件存储实现
│   │   │   ├── message-queue/     # 消息队列实现
│   │   │   ├── ports/             # 端口实现
│   │   │   └── services/          # 外部服务适配器
│   │   ├── event-sourcing/        # 事件溯源（ES）
│   │   ├── event-driven/          # 事件驱动（EDA）
│   │   ├── persistence/           # 数据持久化
│   │   ├── mappers/               # 对象映射器
│   │   ├── factories/             # 工厂
│   │   ├── constants/             # 常量定义
│   │   └── performance/           # 性能优化
│   │
│   └── interface/                 # 接口层（注意单数）
│       ├── http/                  # HTTP 接口
│       │   ├── controllers/       # 控制器
│       │   ├── dto/               # 数据传输对象
│       │   ├── filters/           # 异常过滤器
│       │   ├── guards/            # 守卫（权限）
│       │   ├── interceptors/      # 拦截器
│       │   └── pipes/             # 管道（数据转换）
│       ├── graphql/               # GraphQL 接口（如需要）
│       │   ├── resolvers/         # 解析器
│   │   └── schemas/           # GraphQL Schema
│       └── messaging/             # 消息接口（如需要）
│           └── listeners/         # 消息监听器
├── __tests__/                     # 集成测试和端到端测试
│   ├── integration/               # 集成测试
│   └── e2e/                       # 端到端测试
├── dist/                          # 构建输出（.gitignore）
├── .eslintrc.js 或 eslint.config.mjs  # ESLint 配置
├── jest.config.ts                 # Jest 配置
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.build.json            # 构建用 TypeScript 配置
├── package.json                   # 项目配置
└── README.md                      # 项目说明

注意：单元测试文件（.spec.ts）与源代码放在同一目录
```

**领域层目录说明**（Clean Architecture + DDD）：

**重要原则 - 充血模型（Rich Domain Model）**：

领域对象（实体、聚合根、值对象）必须采用充血模型开发（宪章要求）：

✅ **充血模型（推荐）**：

```typescript
// 好的示例：业务逻辑在领域对象内部
class Order {
  private status: OrderStatus;
  private items: OrderItem[];
  
  // 业务行为：添加订单项
  addItem(product: Product, quantity: number): void {
    // 业务规则：订单已提交后不能添加商品
    if (this.status !== OrderStatus.DRAFT) {
      throw new OrderAlreadySubmittedException();
    }
    // 业务规则：库存检查
    if (product.stock < quantity) {
      throw new InsufficientStockException();
    }
    this.items.push(new OrderItem(product, quantity));
  }
  
  // 业务行为：提交订单
  submit(): void {
    // 业务规则：订单必须至少有一个商品
    if (this.items.length === 0) {
      throw new EmptyOrderException();
    }
    this.status = OrderStatus.SUBMITTED;
    // 发布领域事件
    this.apply(new OrderSubmittedEvent(this.id));
  }
}
```

❌ **贫血模型（禁止）**：

```typescript
// 不好的示例：仅作为数据容器，业务逻辑在服务层
class Order {
  public status: OrderStatus;  // 直接暴露属性
  public items: OrderItem[];
  
  // 只有 getter/setter，没有业务逻辑
  getStatus(): OrderStatus { return this.status; }
  setStatus(status: OrderStatus): void { this.status = status; }
}

// 业务逻辑在服务层（违反DDD原则）
class OrderService {
  addItem(order: Order, product: Product, quantity: number): void {
    // 业务规则在服务层，而非领域对象内部 ❌
    if (order.getStatus() !== OrderStatus.DRAFT) {
      throw new OrderAlreadySubmittedException();
    }
    order.items.push(new OrderItem(product, quantity));
  }
}
```

**充血模型的关键要求**：

1. **封装业务逻辑**：业务规则在领域对象内部实现
2. **行为驱动**：通过方法暴露行为，而非直接暴露属性
3. **不变性保护**：状态变更通过业务方法，确保规则执行
4. **自我验证**：领域对象负责验证自身的有效性
5. **领域事件**：状态变更时发布领域事件

- **aggregates/**：聚合根目录（DDD 核心）
  - 存放管理聚合边界的根实体
  - 必须使用充血模型，封装聚合的业务逻辑和一致性规则
  - 聚合根负责维护聚合内的一致性规则
  - 外部只能通过聚合根访问聚合内的实体
  - 示例：OrderAggregate、UserAggregate

- **entities/**：实体目录（DDD）
  - 存放具有唯一标识的业务对象
  - 必须使用充血模型，包含业务行为和规则
  - 实体的相等性基于标识符
  - 可以被聚合根引用
  - 示例：OrderItem、Address、Profile

- **value-objects/**：值对象目录（DDD）
  - 存放无唯一标识的不可变对象
  - 值对象的相等性基于属性值
  - 示例：Money、EmailAddress、PhoneNumber

- **events/**：领域事件目录（DDD + EDA）
  - 存放领域内发生的重要事件
  - 支持事件驱动架构和事件溯源
  - 示例：OrderCreatedEvent、UserRegisteredEvent

- **repositories/**：仓储接口目录（DDD）
  - 定义领域对象的持久化接口
  - 具体实现在 infrastructure 层
  - 示例：IUserRepository、IOrderRepository

- **services/**：领域服务目录（DDD）
  - 存放不属于任何实体或值对象的领域逻辑
  - 跨多个聚合的领域逻辑
  - 示例：PricingService、InventoryService

- **specifications/**：规格模式目录（DDD）
  - 定义复杂的业务规则和查询条件
  - 支持组合和复用
  - 示例：ActiveUserSpecification

- **rules/**：业务规则目录
  - 存放可复用的业务规则
  - 示例：MinimumAgeRule、StockAvailabilityRule

- **security/**：安全策略目录
  - 存放领域层的安全规则
  - 示例：AccessPolicy、DataIsolationPolicy

- **validation/**：验证逻辑目录
  - 领域对象的验证逻辑
  - 示例：UserValidation

- **validators/**：验证器目录
  - 具体的验证器实现
  - 示例：EmailValidator、PhoneNumberValidator

- **types/**：领域类型定义目录
  - 领域特定的类型定义
  - 示例：UserId、TenantId、Money

- **exceptions/**：领域异常目录
  - 领域特定的异常类型
  - 示例：UserNotFoundException、InsufficientStockException

**重要原则**：实体和聚合根必须分离（宪章要求），这样可以：

- 明确区分普通实体和聚合根的职责
- 聚合根负责维护边界内的一致性
- 提高代码的可读性和可维护性

**应用层目录说明**（Clean Architecture + CQRS + ES + EDA）：

- **use-cases/**：用例目录（应用层核心，Clean Architecture）
  - 存放具体的业务用例，描述系统能做什么
  - 每个用例代表一个完整的业务流程
  - 用例协调领域对象完成业务目标
  - 用例必须在文档和设计中明确提及（宪章要求）
  - 示例：CreateUserUseCase、PlaceOrderUseCase、ProcessPaymentUseCase

- **cqrs/**：CQRS 模式实现目录
  - **bus/**：命令/查询/事件总线
    - 负责分发命令、查询和事件
    - 实现命令和查询的路由
  - **commands/**：命令定义（CQRS 写操作）
    - 改变系统状态的命令
    - 示例：CreateUserCommand、UpdateOrderCommand
    - **handlers/**：命令处理器
      - 执行命令的具体逻辑
      - 通常会调用用例或直接操作领域对象
  - **queries/**：查询定义（CQRS 读操作）
    - 查询系统状态，不改变状态
    - 示例：GetUserQuery、ListOrdersQuery
    - **handlers/**：查询处理器
      - 执行查询的具体逻辑
      - 通常从读模型获取数据
  - **events/**：应用事件（集成事件）
    - 应用层产生的事件，用于跨服务通信
    - **handlers/**：事件处理器
      - 处理应用事件
    - **projectors/**：事件投影器（ES + CQRS）
      - 将事件投影到读模型
      - 支持事件溯源的查询视图构建
  - **event-store/**：事件存储接口（ES）
    - 定义事件存储的接口
    - 支持事件溯源模式
  - **sagas/**：Saga 模式（长事务协调）
    - 协调跨聚合的长事务
    - 处理分布式事务场景

- **services/**：应用服务目录
  - 协调多个用例的应用服务
  - 处理跨用例的逻辑
  - 示例：UserManagementService

- **ports/**：端口接口目录（六边形架构）
  - 定义应用层对外的端口接口
  - 基础设施层提供具体实现
  - 示例：IEmailPort、INotificationPort

- **interfaces/**：应用接口定义目录
  - 应用层的通用接口
  - 示例：ICommandHandler、IQueryHandler

- **exceptions/**：应用异常目录
  - 应用层特定的异常类型
  - 示例：ValidationException、AuthorizationException

- **explorers/**：探索器目录
  - 元数据发现和处理
  - 自动扫描和注册组件

- **common/**：应用层通用组件目录
  - **exceptions/**：通用异常
  - **interfaces/**：通用接口
  - **middleware/**：应用中间件

**重要原则**：

1. **用例是核心**（宪章要求）：用例描述系统的业务能力，必须明确定义
2. **CQRS 分离**（宪章要求）：命令和查询必须分离，支持独立优化
3. **事件驱动**（宪章要求）：通过事件实现系统解耦和异步处理
4. **事件溯源**（宪章要求）：所有状态变更通过事件记录
5. **六边形架构**：通过 ports 和 adapters 实现技术无关性和可替换性

**基础设施层目录说明**（Clean Architecture + ES + EDA）：

- **adapters/**：适配器目录（六边形架构）
  - **repositories/**：仓储实现
    - 实现领域层的仓储接口
    - 数据库 CRUD 操作
    - 示例：UserRepositoryImpl、OrderRepositoryImpl
  - **event-store/**：事件存储实现（ES）
    - 实现事件的持久化和重放
    - 支持事件溯源模式
    - 示例：PostgresEventStore、MongoEventStore
  - **message-queue/**：消息队列实现（EDA）
    - 实现消息的发布和订阅
    - 支持事件驱动架构
    - 示例：RabbitMQAdapter、KafkaAdapter
  - **ports/**：端口实现
    - 实现应用层定义的端口接口
    - 示例：EmailPortImpl、NotificationPortImpl
  - **services/**：外部服务适配器
    - 适配第三方服务
    - 示例：PaymentServiceAdapter、SMSServiceAdapter

- **event-sourcing/**：事件溯源实现（ES）
  - 事件存储的核心逻辑
  - 事件快照管理
  - 事件重放机制
  - 示例：EventSourcingRepository、SnapshotStore

- **event-driven/**：事件驱动实现（EDA）
  - 事件发布订阅机制
  - 事件总线实现
  - 示例：EventBus、DomainEventPublisher

- **persistence/**：数据持久化
  - 数据库连接配置
  - ORM/ODM 配置（TypeORM、Prisma等）
  - 数据迁移
  - 示例：DatabaseModule、MigrationService

- **mappers/**：对象映射器
  - 领域对象 ↔ 持久化模型
  - 领域对象 ↔ DTO
  - 示例：UserMapper、OrderMapper

- **factories/**：工厂
  - 创建复杂对象的工厂
  - 示例：AggregateFactory、DomainEventFactory

- **constants/**：常量定义
  - 基础设施层常量
  - 示例：DatabaseConstants、QueueConstants

- **performance/**：性能优化
  - 缓存实现
  - 性能监控
  - 示例：RedisCacheManager、PerformanceInterceptor

**接口层目录说明**（Clean Architecture - 最外层）：

- **http/**：HTTP 接口（RESTful API）
  - **controllers/**：HTTP 控制器
    - 处理 HTTP 请求，调用应用层
    - 示例：UserController、OrderController
  - **dto/**：数据传输对象
    - 请求体、响应体的数据结构
    - 示例：CreateUserDto、UserResponseDto
  - **filters/**：异常过滤器
    - 统一异常处理和响应格式化
    - 示例：HttpExceptionFilter
  - **guards/**：守卫
    - 认证和授权检查
    - 示例：JwtAuthGuard、RolesGuard、TenantGuard
  - **interceptors/**：拦截器
    - 请求/响应拦截、日志、缓存等
    - 示例：LoggingInterceptor、CacheInterceptor、IsolationContextInterceptor
  - **pipes/**：管道
    - 数据验证和转换
    - 示例：ValidationPipe、ParseIntPipe

- **graphql/**：GraphQL 接口（可选）
  - **resolvers/**：GraphQL 解析器
  - **schemas/**：GraphQL Schema

- **messaging/**：消息接口（可选）
  - **listeners/**：消息监听器
    - 监听外部消息

### 库项目结构（libs/*）

```
libs/my-lib/
├── src/
│   ├── index.ts                   # 库入口（导出所有公共 API）
│   │
│   ├── domain/                    # 领域层（Clean Architecture + DDD）
│   │   ├── aggregates/            # 聚合根（DDD）
│   │   ├── entities/              # 实体（DDD）
│   │   ├── value-objects/         # 值对象（DDD）
│   │   ├── events/                # 领域事件（DDD + EDA）
│   │   ├── repositories/          # 仓储接口（DDD）
│   │   ├── services/              # 领域服务（DDD）
│   │   ├── specifications/        # 规格模式（DDD）
│   │   ├── rules/                 # 业务规则
│   │   ├── types/                 # 领域类型定义
│   │   ├── exceptions/            # 领域异常
│   │   └── validators/            # 验证器
│   │
│   ├── application/               # 应用层（用例 + CQRS）
│   │   ├── use-cases/             # 用例（核心）
│   │   ├── cqrs/                  # CQRS 模式（如需要）
│   │   │   ├── commands/          # 命令定义
│   │   │   │   └── handlers/      # 命令处理器
│   │   │   ├── queries/           # 查询定义
│   │   │   │   └── handlers/      # 查询处理器
│   │   │   └── events/            # 应用事件
│   │   │       └── handlers/      # 事件处理器
│   │   ├── services/              # 应用服务
│   │   ├── ports/                 # 端口接口
│   │   └── interfaces/            # 应用接口
│   │
│   └── infrastructure/            # 基础设施层
│       ├── adapters/              # 适配器
│       │   ├── repositories/      # 仓储实现
│       │   └── services/          # 外部服务适配器
│       ├── mappers/               # 对象映射器
│       └── factories/             # 工厂
├── __tests__/                     # 集成测试
│   └── integration/
├── dist/                          # 构建输出（.gitignore）
│   ├── *.js                       # 编译后的代码
│   └── *.d.ts                     # 类型声明文件
├── eslint.config.mjs              # ESLint 配置
├── jest.config.ts                 # Jest 配置
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.build.json            # 构建用 TypeScript 配置
├── package.json                   # 项目配置
├── README.md                      # 库说明
└── TECHNICAL_DESIGN.md            # 技术设计文档（可选）

注意：单元测试文件（.spec.ts）与源代码放在同一目录
```

## 必需配置文件

### 1. package.json（应用项目）

```json
{
  "name": "my-service",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "nest build && tsc --noEmit",
    "build:swc": "nest build -b swc && tsc --noEmit",
    "dev": "nest start -b swc -w",
    "type-check": "tsc --noEmit",
    "start": "node dist/main.js",
    "start:dev": "nest start",
    "start:debug": "nest start --debug --watch",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-fastify": "^11.1.3",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/ts-config": "workspace:*",
    "@swc/cli": "^0.7.0",
    "@swc/core": "^1.10.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "jest": "^30.0.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.9.2"
  }
}
```

### 2. package.json（库项目）

```json
{
  "name": "@hl8/my-lib",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm clean && pnpm build:swc && pnpm build:types",
    "build:swc": "swc src -d dist --config-file ../../.swcrc",
    "build:types": "tsc --project tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist",
    "type-check": "tsc --noEmit",
    "dev": "swc src -d dist --watch --config-file ../../.swcrc",
    "clean": "rm -rf dist",
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "reflect-metadata": "^0.2.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/ts-config": "workspace:*",
    "@swc/cli": "^0.7.0",
    "@swc/core": "^1.10.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.0.0",
    "jest": "^30.0.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.9.2"
  }
}
```

**关键字段说明**：

- `type: "module"`：声明使用 ES 模块（宪章要求）
- `engines.node: ">=20"`：最低 Node.js 版本（宪章要求）
- `main`：库的入口文件
- `types`：类型声明文件入口
- `exports`：现代的模块导出配置（支持 NodeNext）

### 3. tsconfig.json

```json
{
  "extends": "@repo/ts-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "__tests__"]
}
```

**关键配置**（通过继承 @repo/ts-config/nestjs.json 获得）：

- ✅ `module: "NodeNext"` - 宪章要求
- ✅ `moduleResolution: "NodeNext"` - 宪章要求
- ✅ `target: "ES2022"` - 宪章要求
- ✅ `strict: true` - 宪章要求
- ✅ `moduleDetection: "force"` - 宪章要求
- ✅ `esModuleInterop: true` - 宪章要求
- ✅ `allowSyntheticDefaultImports: true` - 宪章要求
- ✅ `skipLibCheck: true` - 宪章要求

**禁止覆盖**：不允许在项目的 tsconfig.json 中覆盖上述核心配置。

### 4. tsconfig.build.json（库项目）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist"
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts",
    "__tests__"
  ]
}
```

**用途**：生成类型声明文件（.d.ts）供其他项目使用。

### 5. eslint.config.mjs

```javascript
import { nestJsConfig } from '@repo/eslint-config/nest-js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...nestJsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

**关键点**：

- ✅ 继承 `@repo/eslint-config/nest-js` 共享配置
- ✅ 自动获得宪章要求的所有 ESLint 规则
- ✅ 严格的 `any` 类型检查（ERROR 级别）
- ✅ TSDoc 注释规范检查

### 6. jest.config.ts

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/index.ts',
    '!**/__tests__/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
```

## 必需的脚本（宪章要求）

### 应用项目必需脚本

```json
{
  "scripts": {
    // ============================================
    // 构建脚本（宪章要求）
    // ============================================
    "build": "nest build && tsc --noEmit",
    "build:swc": "nest build -b swc && tsc --noEmit",
    "type-check": "tsc --noEmit",
    
    // ============================================
    // 开发脚本
    // ============================================
    "dev": "nest start -b swc -w",
    "start": "node dist/main.js",
    "start:dev": "nest start",
    "start:debug": "nest start --debug --watch",
    
    // ============================================
    // 代码质量（宪章要求）
    // ============================================
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    
    // ============================================
    // 测试（宪章要求）
    // ============================================
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 库项目必需脚本

```json
{
  "scripts": {
    // ============================================
    // 构建脚本（宪章要求）
    // ============================================
    "build": "pnpm clean && pnpm build:swc && pnpm build:types",
    "build:swc": "swc src -d dist --config-file ../../.swcrc",
    "build:types": "tsc --project tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist",
    
    // ============================================
    // 开发脚本
    // ============================================
    "dev": "swc src -d dist --watch --config-file ../../.swcrc",
    
    // ============================================
    // 代码质量（宪章要求）
    // ============================================
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    
    // ============================================
    // 测试（宪章要求）
    // ============================================
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

## 宪章合规性检查清单

在创建或更新后端项目时，使用此检查清单确保符合宪章要求：

### ✅ I. 中文优先原则

- [ ] 所有代码注释使用中文
- [ ] README.md 使用中文编写
- [ ] 错误消息和日志使用中文
- [ ] API 文档使用中文

### ✅ II. 代码即文档原则

- [ ] 所有公共 API 添加完整的 TSDoc 注释
- [ ] 注释包含 @description、@param、@returns、@throws、@example
- [ ] 注释包含业务规则和使用场景说明

### ✅ III. 架构原则

- [ ] 遵循 Clean Architecture 分层（domain、application、infrastructure、interface）
- [ ] 领域对象采用充血模型（业务逻辑在领域对象内部，禁止贫血模型）
- [ ] 领域实体和聚合根分离（entities/ 和 aggregates/ 分开）
- [ ] 聚合根封装聚合边界和一致性规则
- [ ] 用例明确定义（use-cases/ 目录，描述系统业务能力）
- [ ] 命令和查询分离（CQRS：cqrs/commands/ 和 cqrs/queries/）
- [ ] 实现事件溯源（event-store/、event-sourcing/、projectors/）
- [ ] 实现事件驱动（events/、event-driven/、message-queue/、sagas/）
- [ ] 定义领域事件并发布（Domain Events）
- [ ] 依赖关系从外向内（领域层不依赖任何其他层）

### ✅ IV. Monorepo 组织原则

- [ ] 项目位置正确（应用在 apps/，库在 libs/）
- [ ] 使用 pnpm 作为包管理工具
- [ ] 服务模块命名去掉 "-service" 后缀（如 auth 而非 auth-service）

### ✅ V. 质量保证原则

- [ ] ESLint 配置继承 @repo/eslint-config/nest-js
- [ ] TypeScript 配置继承 @repo/ts-config/nestjs.json
- [ ] 使用 MCP 工具进行代码检查

### ✅ VI. 测试架构原则

- [ ] 单元测试文件与源代码同目录（.spec.ts）
- [ ] 集成测试放置在 `__tests__/integration/`
- [ ] 端到端测试放置在 `__tests__/e2e/`（仅应用项目）
- [ ] 核心业务逻辑测试覆盖率 ≥ 80%
- [ ] 所有公共 API 有对应的测试用例

### ✅ VII. 数据隔离与共享原则

- [ ] 数据模型包含隔离字段（tenantId、organizationId、departmentId、userId）
- [ ] 为隔离字段创建数据库索引
- [ ] 数据明确分类为共享/非共享
- [ ] API 请求携带隔离标识
- [ ] 缓存键包含隔离层级信息

### ✅ VIII. 统一语言原则

- [ ] 使用 docs/definition-of-terms.mdc 中定义的统一术语
- [ ] 核心业务实体命名符合术语定义
- [ ] 技术实现能够追溯到业务术语

### ✅ IX. TypeScript `any` 类型使用原则

- [ ] ESLint 启用 no-explicit-any 规则
- [ ] 使用 `any` 时添加注释说明理由
- [ ] 使用 `any` 的代码测试覆盖率 ≥ 90%
- [ ] 优先使用 `unknown` 和类型保护

### ✅ 技术约束 - TypeScript 配置

- [ ] `module: "NodeNext"`
- [ ] `moduleResolution: "NodeNext"`
- [ ] `target: "ES2022"`
- [ ] `strict: true`
- [ ] `moduleDetection: "force"`
- [ ] `esModuleInterop: true`
- [ ] `allowSyntheticDefaultImports: true`
- [ ] `skipLibCheck: true`

### ✅ 技术约束 - 编译工具

- [ ] 包含 `build` 脚本（tsc 或 nest build）
- [ ] 包含 `build:swc` 脚本（swc 快速编译）
- [ ] 包含 `type-check` 脚本（tsc --noEmit）
- [ ] 包含 `dev` 脚本（swc watch 模式）

### ✅ 技术约束 - package.json

- [ ] `type: "module"`
- [ ] `engines.node: ">=20"`
- [ ] 库项目包含 `main`、`types`、`exports` 字段

## 快速开始：创建新的后端项目

### 1. 创建应用项目

```bash
cd /home/arligle/hl8/hl8-saas-platform-turborepo/apps

# 使用 NestJS CLI 创建项目
pnpm exec nest new my-service

cd my-service

# 复制标准配置文件
cp ../api/package.json ./package.json  # 然后修改 name
cp ../api/tsconfig.json ./tsconfig.json
cp ../api/eslint.config.mjs ./eslint.config.mjs
cp ../api/jest.config.ts ./jest.config.ts

# 更新 package.json
# 1. 修改 name 为你的服务名
# 2. 添加 type: "module"
# 3. 添加 engines.node: ">=20"
# 4. 更新 scripts 使用标准脚本

# 安装依赖
pnpm install

# 验证配置
pnpm type-check
pnpm lint
pnpm test
pnpm build:swc
```

### 2. 创建库项目

```bash
cd /home/arligle/hl8/hl8-saas-platform-turborepo/libs

# 创建目录结构
mkdir -p my-lib/src
cd my-lib

# 初始化 package.json
pnpm init

# 复制标准配置文件
cp ../logger/package.json ./package.json  # 然后修改
cp ../logger/tsconfig.json ./tsconfig.json
cp ../logger/tsconfig.build.json ./tsconfig.build.json
cp ../logger/eslint.config.mjs ./eslint.config.mjs
cp ../logger/jest.config.ts ./jest.config.ts

# 创建入口文件
cat > src/index.ts << 'EOF'
/**
 * @hl8/my-lib 库入口
 *
 * @description 导出所有公共 API
 */

export * from './my-module';
EOF

# 更新 package.json
# 1. 修改 name 为 @hl8/my-lib
# 2. 确保包含 type、engines、main、types、exports
# 3. 使用标准的构建脚本

# 安装依赖
pnpm install

# 验证配置
pnpm type-check
pnpm lint
pnpm build
```

## 标准文档要求

### README.md 模板

```markdown
# [项目名称]

[一句话描述项目的功能和定位]

## 概述

[详细的项目说明，包括业务背景和技术方案]

## 功能特性

- 特性1：[描述]
- 特性2：[描述]
- 特性3：[描述]

## 技术栈

- Node.js >= 20
- TypeScript 5.9.2
- NestJS >= 11
- [其他关键依赖]

## 安装

\`\`\`bash
pnpm install
\`\`\`

## 开发

\`\`\`bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 运行测试
pnpm test
\`\`\`

## 构建

\`\`\`bash
# 快速构建（推荐）
pnpm build:swc

# 标准构建
pnpm build
\`\`\`

## 测试

\`\`\`bash
# 运行所有测试
pnpm test

# 监视模式
pnpm test:watch

# 测试覆盖率
pnpm test:cov
\`\`\`

## 项目结构

\`\`\`
src/
├── domain/              # 领域层
│   ├── entities/        # 实体
│   ├── aggregates/      # 聚合根
│   ├── value-objects/   # 值对象
│   └── events/          # 领域事件
├── application/         # 应用层
│   ├── use-cases/       # 用例（核心）
│   ├── commands/        # 命令（CQRS）
│   ├── queries/         # 查询（CQRS）
│   └── services/        # 应用服务
├── infrastructure/      # 基础设施层
│   ├── persistence/     # 数据持久化
│   └── adapters/        # 外部服务适配器
└── interfaces/          # 接口层（仅应用项目）
    ├── controllers/     # HTTP 控制器
    ├── dto/             # 数据传输对象
    └── filters/         # 异常过滤器
\`\`\`

## 配置

本项目遵循 HL8 SAAS Platform 的统一配置标准：

- TypeScript: NodeNext 模块系统
- ESLint: 严格的类型安全检查
- 测试: Jest + Supertest

详见：[项目宪章](../../.specify/memory/constitution.md)

## API 文档

[如有 Swagger/OpenAPI，提供链接]

## 许可证

[许可证信息]
```

### TECHNICAL_DESIGN.md 模板（库项目）

```markdown
# [库名称] 技术设计文档

## 设计目标

[描述库的设计目标和解决的问题]

## 核心概念

### 领域模型

[描述核心领域实体和值对象]

### 架构设计

[说明架构选择和设计决策]

## API 设计

### 公共接口

[列出所有导出的公共 API]

### 使用示例

\`\`\`typescript
// 示例代码
\`\`\`

## 技术实现

### 依赖关系

[说明关键依赖和理由]

### 设计模式

[说明使用的设计模式]

## 测试策略

- 单元测试覆盖率：≥ 80%
- 集成测试覆盖关键路径

## 性能考虑

[说明性能优化策略]

## 安全考虑

[说明安全相关的设计]
```

## 开发工作流

### 日常开发流程

```bash
# 1. 启动开发模式（swc 热重载）
pnpm dev

# 2. 编写代码
# - 遵循 Clean Architecture 分层
# - 添加完整的 TSDoc 注释
# - 单元测试与代码同目录

# 3. 提交前检查
pnpm type-check  # 类型检查
pnpm lint        # 代码规范
pnpm test        # 运行测试

# 4. 构建验证
pnpm build:swc   # 快速构建
```

### 代码审查检查点

- [ ] 代码结构符合 Clean Architecture
- [ ] 使用统一术语（Platform、Tenant、Organization、Department、User）
- [ ] 所有公共 API 有完整的 TSDoc 注释
- [ ] 没有使用 `any` 类型（或有充分理由）
- [ ] 测试覆盖率满足要求（≥ 80%）
- [ ] 数据模型包含隔离字段
- [ ] package.json 包含所有必需脚本
- [ ] TypeScript 配置继承共享配置

## CI/CD 集成

### 推荐的 GitHub Actions 工作流

```yaml
name: Backend Project CI

on:
  push:
    paths:
      - 'apps/**'
      - 'libs/**'
      - 'packages/**'
  pull_request:
    paths:
      - 'apps/**'
      - 'libs/**'
      - 'packages/**'

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type Check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build:swc
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

## 性能基准

### 构建性能目标

| 项目类型 | 初始构建 | 增量构建 | 热重载 |
|---------|---------|---------|--------|
| 小型应用 | < 15秒 | < 5秒 | < 1秒 |
| 中型应用 | < 30秒 | < 10秒 | < 2秒 |
| 大型应用 | < 60秒 | < 20秒 | < 3秒 |
| 库项目 | < 10秒 | < 3秒 | < 0.5秒 |

### 测试性能目标

| 测试类型 | 执行时间 |
|---------|---------|
| 单元测试 | 毫秒级 |
| 集成测试 | 秒级 |
| 端到端测试 | 分钟级 |

## 常见问题

### Q1: 应用项目和库项目的构建脚本为什么不同？

**A**:

- **应用项目**使用 NestJS CLI（`nest build -b swc`），因为它提供了开箱即用的项目管理和构建功能
- **库项目**直接使用 swc CLI，因为它们需要更灵活的控制来生成类型声明文件和优化输出

### Q2: 为什么要同时运行 swc 和 tsc？

**A**:

- **swc**：快速编译代码（快 20-70 倍），提升开发体验
- **tsc**：严格的类型检查，确保类型安全
- 两者结合：既快又安全

### Q3: 可以跳过类型检查吗？

**A**: 不可以。根据宪章要求：

- 所有构建脚本必须包含类型检查（`tsc --noEmit`）
- CI/CD 流程必须独立运行类型检查
- 类型检查失败必须阻塞构建

### Q4: 库项目一定要生成类型声明文件吗？

**A**: 是的。库项目的输出会被其他项目使用，必须提供：

- JavaScript 代码（.js）
- 类型声明文件（.d.ts）
- 类型声明映射（.d.ts.map，可选）

### Q5: 可以使用 CommonJS 吗？

**A**: 不可以。根据宪章要求：

- 所有服务端项目必须使用 NodeNext 模块系统
- 禁止使用 CommonJS（`module: "commonjs"`）
- 项目处于重新开发初期，无需向后兼容

### Q6: 实体和聚合根有什么区别？为什么要分离？

**A**: 这是 DDD（领域驱动设计）的核心概念，宪章要求必须分离：

**实体（Entity）**：

- 具有唯一标识的业务对象
- 相等性基于标识符（ID）
- 可以被聚合根引用
- 示例：User、Product、OrderItem

**聚合根（Aggregate Root）**：

- 是一种特殊的实体，管理聚合边界
- 负责维护聚合内的一致性规则
- 是外部访问聚合的唯一入口
- 控制聚合内实体的生命周期
- 示例：OrderAggregate（管理 Order + OrderItems）

**为什么要分离**：

- 明确职责：聚合根有额外的边界管理职责
- 一致性保证：聚合根确保业务规则的原子性
- 事务边界：聚合根定义了事务的边界
- 代码清晰：开发者一眼就能识别哪些是聚合根

## 故障排除

### 问题：类型检查失败

**症状**：`tsc --noEmit` 报错

**排查步骤**：

1. 检查 TypeScript 版本（应为 5.9.2）
2. 检查 tsconfig.json 是否正确继承 @repo/ts-config/nestjs.json
3. 检查是否有 `any` 类型使用
4. 检查是否有 null/undefined 相关的严格模式错误

### 问题：swc 编译失败

**症状**：swc 命令报错

**排查步骤**：

1. 检查 .swcrc 配置是否存在
2. 检查 @swc/cli 和 @swc/core 是否安装
3. 检查源代码是否有不支持的语法

### 问题：热重载不工作

**症状**：修改代码后不自动重新编译

**排查步骤**：

1. 确认使用的是 `pnpm dev` 命令
2. 应用项目：检查是否使用 `-w` 参数（`nest start -b swc -w`）
3. 库项目：检查是否使用 `--watch` 参数（`swc src -d dist --watch`）

## 参考资料

- [项目宪章](../.specify/memory/constitution.md) - 所有核心原则和技术约束
- [构建策略](./build-strategy.md) - tsc + swc 详细说明
- [TypeScript 配置](./ts-config.md) - NodeNext 配置详解
- [ESLint 使用指南](./eslint-guide.md) - 代码规范检查
- [术语定义](./definition-of-terms.mdc) - 统一语言参考
- [TypeScript `any` 类型说明](./any-except.md) - 类型安全指南

## 附录：完整的项目模板

### 应用项目完整配置文件列表

```
apps/my-service/
├── package.json              # ✅ 包含所有必需脚本
├── tsconfig.json             # ✅ 继承 @repo/ts-config/nestjs.json
├── tsconfig.build.json       # ✅ 构建配置
├── eslint.config.mjs         # ✅ 继承 @repo/eslint-config/nest-js
├── jest.config.ts            # ✅ Jest 配置
├── .gitignore                # ✅ 忽略 dist、node_modules 等
├── README.md                 # ✅ 中文文档
└── src/
    └── main.ts               # ✅ 应用入口
```

### 库项目完整配置文件列表

```
libs/my-lib/
├── package.json              # ✅ 包含 main、types、exports
├── tsconfig.json             # ✅ 继承 @repo/ts-config/nestjs.json
├── tsconfig.build.json       # ✅ 类型声明生成配置
├── eslint.config.mjs         # ✅ 继承 @repo/eslint-config/nest-js
├── jest.config.ts            # ✅ Jest 配置
├── .gitignore                # ✅ 忽略 dist、node_modules 等
├── README.md                 # ✅ 中文文档
├── TECHNICAL_DESIGN.md       # ✅ 技术设计文档
└── src/
    └── index.ts              # ✅ 库入口（导出所有公共 API）
```

---

**文档版本**: 1.0.0  
**基于宪章**: v1.4.2  
**最后更新**: 2025-10-11  
**维护者**: HL8 技术团队
