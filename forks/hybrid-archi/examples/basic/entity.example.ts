/**
 * 实体示例
 *
 * 本示例展示如何创建和使用实体（Entity）
 *
 * @description 实体是具有唯一标识符和生命周期的领域对象，遵循充血模型设计
 * @example
 */

import { BaseEntity } from "../../src/domain/entities/base/base-entity";
import { EntityId } from "../../src/domain/value-objects/entity-id";
import { IPartialAuditInfo } from "../../src/domain/entities/base/audit-info";

// 值对象（用于实体属性）
import { Email, Money } from "./value-object.example";

// ============================================================================
// 示例 1: 简单实体 - Product
// ============================================================================

/**
 * 产品状态枚举
 */
export enum ProductStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Discontinued = "DISCONTINUED",
}

/**
 * Product 实体
 *
 * 特点：
 * - 充血模型：业务逻辑在实体内
 * - 私有属性：使用私有属性保护数据
 * - 公开方法：通过方法暴露业务操作
 * - 验证规则：业务规则在实体内验证
 */
export class Product extends BaseEntity {
  private constructor(
    id: EntityId,
    private _name: string,
    private _price: Money,
    private _status: ProductStatus,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
    this.validate();
  }

  /**
   * 工厂方法：创建新产品
   */
  static create(name: string, price: Money, tenantId: string): Product {
    return new Product(EntityId.generate(), name, price, ProductStatus.Active, {
      createdBy: "system",
      tenantId,
    });
  }

  /**
   * 业务方法：更新价格
   */
  updatePrice(newPrice: Money): void {
    this.ensureActive();

    if (newPrice.amount <= 0) {
      throw new Error("Price must be greater than zero");
    }

    this._price = newPrice;
    this.updateTimestamp();
  }

  /**
   * 业务方法：停用产品
   */
  deactivate(): void {
    if (this._status === ProductStatus.Inactive) {
      return; // 已经停用，无需操作
    }

    this._status = ProductStatus.Inactive;
    this.updateTimestamp();
  }

  /**
   * 业务方法：激活产品
   */
  activate(): void {
    if (this._status === ProductStatus.Active) {
      return; // 已经激活，无需操作
    }

    if (this._status === ProductStatus.Discontinued) {
      throw new Error("Cannot activate discontinued product");
    }

    this._status = ProductStatus.Active;
    this.updateTimestamp();
  }

  /**
   * 业务方法：停产
   */
  discontinue(): void {
    this._status = ProductStatus.Discontinued;
    this.updateTimestamp();
  }

  /**
   * 业务规则：确保产品处于活跃状态
   */
  private ensureActive(): void {
    if (this._status !== ProductStatus.Active) {
      throw new Error("Product is not active");
    }
  }

  /**
   * 验证产品数据
   */
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Product name is required");
    }
    if (this._price.amount <= 0) {
      throw new Error("Product price must be greater than zero");
    }
  }

  // Getter 方法
  get name(): string {
    return this._name;
  }

  get price(): Money {
    return this._price;
  }

  get status(): ProductStatus {
    return this._status;
  }

  isActive(): boolean {
    return this._status === ProductStatus.Active;
  }

  isDiscontinued(): boolean {
    return this._status === ProductStatus.Discontinued;
  }
}

// ============================================================================
// 示例 2: 复杂实体 - Customer
// ============================================================================

/**
 * 客户类型枚举
 */
export enum CustomerType {
  Individual = "INDIVIDUAL",
  Corporate = "CORPORATE",
}

/**
 * 客户状态枚举
 */
export enum CustomerStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Blocked = "BLOCKED",
}

/**
 * Customer 实体
 *
 * 展示更复杂的业务逻辑和状态管理
 */
export class Customer extends BaseEntity {
  private constructor(
    id: EntityId,
    private _name: string,
    private _email: Email,
    private _type: CustomerType,
    private _status: CustomerStatus,
    private _creditLimit: Money,
    private _usedCredit: Money,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
    this.validate();
  }

  static create(
    name: string,
    email: Email,
    type: CustomerType,
    creditLimit: Money,
    tenantId: string,
  ): Customer {
    return new Customer(
      EntityId.generate(),
      name,
      email,
      type,
      CustomerStatus.Active,
      creditLimit,
      Money.create(0, creditLimit.currency),
      { createdBy: "system", tenantId },
    );
  }

  /**
   * 业务方法：使用信用额度
   */
  useCredit(amount: Money): void {
    this.ensureActive();
    this.ensureSameCurrency(amount);

    const newUsedCredit = this._usedCredit.add(amount);
    if (newUsedCredit.amount > this._creditLimit.amount) {
      throw new Error("Credit limit exceeded");
    }

    this._usedCredit = newUsedCredit;
    this.updateTimestamp();
  }

  /**
   * 业务方法：归还信用额度
   */
  repayCredit(amount: Money): void {
    this.ensureSameCurrency(amount);

    if (amount.amount > this._usedCredit.amount) {
      throw new Error("Repayment amount exceeds used credit");
    }

    this._usedCredit = this._usedCredit.subtract(amount);
    this.updateTimestamp();
  }

  /**
   * 业务方法：调整信用额度
   */
  adjustCreditLimit(newLimit: Money): void {
    this.ensureActive();
    this.ensureSameCurrency(newLimit);

    if (newLimit.amount < this._usedCredit.amount) {
      throw new Error("New credit limit cannot be less than used credit");
    }

    this._creditLimit = newLimit;
    this.updateTimestamp();
  }

  /**
   * 业务方法：封锁客户
   */
  block(reason: string): void {
    if (this._status === CustomerStatus.Blocked) {
      return;
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error("Block reason is required");
    }

    this._status = CustomerStatus.Blocked;
    this.updateTimestamp();
  }

  /**
   * 业务方法：解锁客户
   */
  unblock(): void {
    if (this._status !== CustomerStatus.Blocked) {
      return;
    }

    this._status = CustomerStatus.Active;
    this.updateTimestamp();
  }

  /**
   * 查询方法：获取可用信用额度
   */
  getAvailableCredit(): Money {
    return this._creditLimit.subtract(this._usedCredit);
  }

  /**
   * 查询方法：检查是否可以使用信用
   */
  canUseCredit(amount: Money): boolean {
    if (this._status !== CustomerStatus.Active) {
      return false;
    }

    try {
      this.ensureSameCurrency(amount);
      const availableCredit = this.getAvailableCredit();
      return amount.amount <= availableCredit.amount;
    } catch {
      return false;
    }
  }

  private ensureActive(): void {
    if (this._status !== CustomerStatus.Active) {
      throw new Error("Customer is not active");
    }
  }

  private ensureSameCurrency(amount: Money): void {
    if (amount.currency !== this._creditLimit.currency) {
      throw new Error("Currency mismatch");
    }
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Customer name is required");
    }
    if (this._creditLimit.amount < 0) {
      throw new Error("Credit limit cannot be negative");
    }
    if (this._usedCredit.amount < 0) {
      throw new Error("Used credit cannot be negative");
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get type(): CustomerType {
    return this._type;
  }

  get status(): CustomerStatus {
    return this._status;
  }

  get creditLimit(): Money {
    return this._creditLimit;
  }

  get usedCredit(): Money {
    return this._usedCredit;
  }

  isActive(): boolean {
    return this._status === CustomerStatus.Active;
  }

  isBlocked(): boolean {
    return this._status === CustomerStatus.Blocked;
  }

  isCorporate(): boolean {
    return this._type === CustomerType.Corporate;
  }
}

// ============================================================================
// 运行示例
// ============================================================================

function runExamples() {
  console.log("=".repeat(80));
  console.log("实体示例");
  console.log("=".repeat(80));

  // 示例 1: Product 实体
  console.log("\n【示例 1】Product 实体 - 充血模型");
  console.log("-".repeat(80));

  const price = Money.create(99.99, "USD");
  const product = Product.create("iPhone 15", price, "tenant-123");

  console.log("产品 ID:", product.id.toString());
  console.log("产品名称:", product.name);
  console.log("产品价格:", product.price.toString());
  console.log("产品状态:", product.status);
  console.log("是否激活:", product.isActive());

  // 业务操作：更新价格
  const newPrice = Money.create(89.99, "USD");
  product.updatePrice(newPrice);
  console.log("\n更新价格后:", product.price.toString());

  // 业务操作：停用产品
  product.deactivate();
  console.log("停用后状态:", product.status);
  console.log("是否激活:", product.isActive());

  try {
    // 尝试更新已停用产品的价格
    product.updatePrice(Money.create(79.99, "USD"));
  } catch (error) {
    console.log("业务规则验证:", (error as Error).message);
  }

  // 示例 2: Customer 实体
  console.log("\n【示例 2】Customer 实体 - 复杂业务逻辑");
  console.log("-".repeat(80));

  const email = Email.create("customer@example.com");
  const creditLimit = Money.create(10000, "USD");
  const customer = Customer.create(
    "John Doe",
    email,
    CustomerType.Individual,
    creditLimit,
    "tenant-123",
  );

  console.log("客户 ID:", customer.id.toString());
  console.log("客户名称:", customer.name);
  console.log("客户邮箱:", customer.email.value);
  console.log("客户类型:", customer.type);
  console.log("信用额度:", customer.creditLimit.toString());
  console.log("可用额度:", customer.getAvailableCredit().toString());

  // 业务操作：使用信用额度
  const purchaseAmount = Money.create(3000, "USD");
  console.log("\n尝试使用信用:", purchaseAmount.toString());
  console.log("是否可以使用:", customer.canUseCredit(purchaseAmount));

  customer.useCredit(purchaseAmount);
  console.log("使用后的已用额度:", customer.usedCredit.toString());
  console.log("剩余可用额度:", customer.getAvailableCredit().toString());

  // 业务操作：归还信用
  const repayment = Money.create(1000, "USD");
  customer.repayCredit(repayment);
  console.log("\n归还后的已用额度:", customer.usedCredit.toString());
  console.log("剩余可用额度:", customer.getAvailableCredit().toString());

  // 业务操作：封锁客户
  customer.block("Suspicious activity detected");
  console.log("\n客户状态:", customer.status);
  console.log("是否封锁:", customer.isBlocked());

  try {
    // 尝试对已封锁的客户使用信用
    customer.useCredit(Money.create(100, "USD"));
  } catch (error) {
    console.log("业务规则验证:", (error as Error).message);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ 实体示例运行完成");
  console.log("=".repeat(80));
  console.log("\n💡 关键要点:");
  console.log("  1. 充血模型：业务逻辑在实体内，不在服务层");
  console.log("  2. 私有属性：使用私有属性保护数据完整性");
  console.log("  3. 业务方法：通过方法暴露业务操作");
  console.log("  4. 业务规则：在实体内验证业务规则");
  console.log("  5. 不可变性：尽可能使用不可变的值对象");
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runExamples();
}

export { runExamples };
