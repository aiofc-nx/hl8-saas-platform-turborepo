/**
 * 值对象异常类
 *
 * @description 值对象验证失败时抛出的异常类
 * @since 1.0.0
 */

import { DomainValidationException } from "../../exceptions/base/base-domain-exception.js";

/**
 * 邮箱验证异常
 *
 * @description 邮箱值对象验证失败时抛出
 */
export class InvalidEmailException extends DomainValidationException {
  constructor(message: string, email?: string) {
    super(
      message,
      "email",
      email,
      { email }
    );
  }
}

/**
 * 密码验证异常
 *
 * @description 密码值对象验证失败时抛出
 */
export class InvalidPasswordException extends DomainValidationException {
  constructor(message: string, password?: string) {
    super(
      message,
      "password", 
      password,
      { password }
    );
  }
}

/**
 * 弱密码异常
 *
 * @description 密码强度不足时抛出
 */
export class WeakPasswordException extends InvalidPasswordException {
  constructor(message: string, password?: string) {
    super(message, password);
  }
}

/**
 * 用户名验证异常
 *
 * @description 用户名值对象验证失败时抛出
 */
export class InvalidUsernameException extends DomainValidationException {
  constructor(message: string, username?: string) {
    super(
      message,
      "username",
      username,
      { username }
    );
  }
}

/**
 * 电话号码验证异常
 *
 * @description 电话号码值对象验证失败时抛出
 */
export class InvalidPhoneNumberException extends DomainValidationException {
  constructor(message: string, phoneNumber?: string) {
    super(
      message,
      "phoneNumber",
      phoneNumber,
      { phoneNumber }
    );
  }
}
