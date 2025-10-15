/**
 * 值对象示例
 *
 * 本示例展示如何创建和使用值对象（Value Object）
 *
 * @description 值对象是没有概念标识的不可变对象，相等性基于属性值
 * @example
 */

import { BaseValueObject } from "../../src/domain/value-objects/base-value-object.js";

// ============================================================================
// 示例 1: 简单值对象 - Email
// ============================================================================

/**
 * Email 值对象
 *
 * 特点：
 * - 不可变：创建后不能修改
 * - 验证：创建时自动验证格式
 * - 相等性：基于值比较
 */
export class Email extends BaseValueObject {
  private constructor(private readonly _value: string) {
    super();
    this.validate();
  }

  /**
   * 工厂方法：创建 Email 值对象
   */
  static create(value: string): Email {
    return new Email(value);
  }

  /**
   * 获取邮箱地址
   */
  get value(): string {
    return this._value;
  }

  /**
   * 验证邮箱格式
   */
  protected validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new Error(`Invalid email format: ${this._value}`);
    }
  }

  /**
   * 比较两个邮箱是否相等
   */
  equals(other: Email | null | undefined): boolean {
    if (!super.equals(other)) return false;
    return this._value === (other as Email)._value;
  }

  /**
   * 获取字符串表示
   */
  override toString(): string {
    return this._value;
  }

  /**
   * 获取 JSON 表示
   */
  override toJSON(): Record<string, unknown> {
    return {
      type: "Email",
      value: this._value,
    };
  }
}

// ============================================================================
// 示例 2: 复杂值对象 - Money
// ============================================================================

/**
 * Money 值对象
 *
 * 特点：
 * - 包含多个属性（金额、货币）
 * - 提供业务操作方法（加、减、乘）
 * - 确保货币一致性
 */
export class Money extends BaseValueObject {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string,
  ) {
    super();
    this.validate();
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  protected validate(): void {
    if (this._amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    if (!this._currency || this._currency.length !== 3) {
      throw new Error("Currency must be 3-letter code (e.g., USD, CNY)");
    }
  }

  /**
   * 加法运算（返回新对象）
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  /**
   * 减法运算（返回新对象）
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const newAmount = this._amount - other._amount;
    if (newAmount < 0) {
      throw new Error("Result amount cannot be negative");
    }
    return new Money(newAmount, this._currency);
  }

  /**
   * 乘法运算（返回新对象）
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error("Factor cannot be negative");
    }
    return new Money(this._amount * factor, this._currency);
  }

  /**
   * 确保货币类型一致
   */
  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Currency mismatch: ${this._currency} vs ${other._currency}`,
      );
    }
  }

  equals(other: Money | null | undefined): boolean {
    if (!super.equals(other)) return false;
    const otherMoney = other as Money;
    return (
      this._amount === otherMoney._amount &&
      this._currency === otherMoney._currency
    );
  }

  override toString(): string {
    return `${this._amount} ${this._currency}`;
  }

  override toJSON(): Record<string, unknown> {
    return {
      type: "Money",
      amount: this._amount,
      currency: this._currency,
    };
  }

  protected override arePropertiesEqual(other: BaseValueObject): boolean {
    const otherMoney = other as Money;
    return (
      this._amount === otherMoney._amount &&
      this._currency === otherMoney._currency
    );
  }
}

// ============================================================================
// 示例 3: 地址值对象
// ============================================================================

/**
 * Address 值对象
 *
 * 展示包含多个字段的复杂值对象
 */
export class Address extends BaseValueObject {
  private constructor(
    private readonly _street: string,
    private readonly _city: string,
    private readonly _province: string,
    private readonly _postalCode: string,
    private readonly _country: string,
  ) {
    super();
    this.validate();
  }

  static create(
    street: string,
    city: string,
    province: string,
    postalCode: string,
    country: string,
  ): Address {
    return new Address(street, city, province, postalCode, country);
  }

  get street(): string {
    return this._street;
  }

  get city(): string {
    return this._city;
  }

  get province(): string {
    return this._province;
  }

  get postalCode(): string {
    return this._postalCode;
  }

  get country(): string {
    return this._country;
  }

  protected validate(): void {
    if (!this._street || this._street.trim().length === 0) {
      throw new Error("Street is required");
    }
    if (!this._city || this._city.trim().length === 0) {
      throw new Error("City is required");
    }
    if (!this._country || this._country.trim().length === 0) {
      throw new Error("Country is required");
    }
  }

  /**
   * 获取完整地址字符串
   */
  getFullAddress(): string {
    return `${this._street}, ${this._city}, ${this._province} ${this._postalCode}, ${this._country}`;
  }

  equals(other: Address | null | undefined): boolean {
    if (!super.equals(other)) return false;
    const otherAddr = other as Address;
    return (
      this._street === otherAddr._street &&
      this._city === otherAddr._city &&
      this._province === otherAddr._province &&
      this._postalCode === otherAddr._postalCode &&
      this._country === otherAddr._country
    );
  }

  override toString(): string {
    return this.getFullAddress();
  }

  override toJSON(): Record<string, unknown> {
    return {
      type: "Address",
      street: this._street,
      city: this._city,
      province: this._province,
      postalCode: this._postalCode,
      country: this._country,
    };
  }

  protected override arePropertiesEqual(other: BaseValueObject): boolean {
    const otherAddr = other as Address;
    return (
      this._street === otherAddr._street &&
      this._city === otherAddr._city &&
      this._province === otherAddr._province &&
      this._postalCode === otherAddr._postalCode &&
      this._country === otherAddr._country
    );
  }
}

// ============================================================================
// 运行示例
// ============================================================================

function runExamples() {
  console.log("=".repeat(80));
  console.log("值对象示例");
  console.log("=".repeat(80));

  // 示例 1: Email 值对象
  console.log("\n【示例 1】Email 值对象");
  console.log("-".repeat(80));

  const email1 = Email.create("user@example.com");
  const email2 = Email.create("user@example.com");
  const email3 = Email.create("admin@example.com");

  console.log("Email 1:", email1.value);
  console.log("Email 2:", email2.value);
  console.log("Email 3:", email3.value);
  console.log("email1 equals email2:", email1.equals(email2)); // true
  console.log("email1 equals email3:", email1.equals(email3)); // false

  try {
    Email.create("invalid-email");
  } catch (error) {
    console.log("验证失败:", (error as Error).message);
  }

  // 示例 2: Money 值对象
  console.log("\n【示例 2】Money 值对象");
  console.log("-".repeat(80));

  const price1 = Money.create(100, "USD");
  const price2 = Money.create(50, "USD");
  const total = price1.add(price2);
  const doubled = price1.multiply(2);

  console.log("Price 1:", price1.toString());
  console.log("Price 2:", price2.toString());
  console.log("Total:", total.toString());
  console.log("Doubled:", doubled.toString());

  try {
    const priceInCNY = Money.create(100, "CNY");
    price1.add(priceInCNY); // 货币不一致，抛出异常
  } catch (error) {
    console.log("货币不一致错误:", (error as Error).message);
  }

  // 示例 3: Address 值对象
  console.log("\n【示例 3】Address 值对象");
  console.log("-".repeat(80));

  const address = Address.create(
    "123 Main Street",
    "San Francisco",
    "CA",
    "94102",
    "USA",
  );

  console.log("完整地址:", address.getFullAddress());
  console.log("城市:", address.city);
  console.log("国家:", address.country);
  console.log("JSON:", JSON.stringify(address.toJSON(), null, 2));

  console.log("\n" + "=".repeat(80));
  console.log("✅ 值对象示例运行完成");
  console.log("=".repeat(80));
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runExamples();
}

export { runExamples };
