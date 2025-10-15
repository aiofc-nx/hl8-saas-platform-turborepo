/**
 * 用户凭证实体
 *
 * @description 用户认证凭证信息
 *
 * @class UserCredentials
 * @since 1.0.0
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";
import type { IPureLogger } from "@hl8/pure-logger";
import { USER_LOGIN_ATTEMPTS } from "../../../constants/user.constants.js";

export class UserCredentials extends BaseEntity {
  constructor(
    id: EntityId,
    private _userId: EntityId,
    private _passwordHash: string,
    private _passwordSalt: string,
    private _failedLoginAttempts: number,
    private _lockedUntil: Date | null,
    private _passwordChangedAt: Date | null,
    private _mfaEnabled: boolean,
    private _mfaSecret: string | null,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);
  }

  public static create(
    id: EntityId,
    userId: EntityId,
    passwordHash: string,
    passwordSalt: string,
    auditInfo: IPartialAuditInfo,
  ): UserCredentials {
    return new UserCredentials(
      id,
      userId,
      passwordHash,
      passwordSalt,
      0,
      null,
      new Date(),
      false,
      null,
      auditInfo,
    );
  }

  public getUserId(): EntityId {
    return this._userId;
  }

  public getPasswordHash(): string {
    return this._passwordHash;
  }

  public recordFailedLogin(): void {
    this._failedLoginAttempts++;

    if (this._failedLoginAttempts >= USER_LOGIN_ATTEMPTS.MAX_ATTEMPTS) {
      const lockoutMinutes = USER_LOGIN_ATTEMPTS.LOCK_DURATION;
      this._lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    }

    this.updateTimestamp();
  }

  public resetFailedAttempts(): void {
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
    this.updateTimestamp();
  }

  public isLocked(): boolean {
    if (!this._lockedUntil) {
      return false;
    }
    return this._lockedUntil > new Date();
  }

  public changePassword(
    newPasswordHash: string,
    newPasswordSalt: string,
    updatedBy?: string,
  ): void {
    this._passwordHash = newPasswordHash;
    this._passwordSalt = newPasswordSalt;
    this._passwordChangedAt = new Date();
    this.updateTimestamp();
  }

  public toObject(): object {
    return {
      id: this.id.toString(),
      userId: this._userId.toString(),
      failedLoginAttempts: this._failedLoginAttempts,
      lockedUntil: this._lockedUntil?.toISOString(),
      passwordChangedAt: this._passwordChangedAt?.toISOString(),
      mfaEnabled: this._mfaEnabled,
    };
  }
}
