/**
 * 连接管理器测试
 *
 * @description 测试 ConnectionManager 的核心功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { ConnectionManager } from './connection.manager.js';
import { DatabaseConnectionException } from '../exceptions/database-connection.exception.js';

describe('ConnectionManager', () => {
  let manager: ConnectionManager;
  let mockOrm: jest.Mocked<MikroORM>;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockOrm = {
      isConnected: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(undefined),
      config: {
        get: jest.fn((key: string) => {
          const config: any = {
            type: 'postgresql',
            host: 'localhost',
            port: 5432,
            dbName: 'test_db',
          };
          return config[key];
        }),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionManager,
        {
          provide: MikroORM,
          useValue: mockOrm,
        },
        {
          provide: FastifyLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    manager = module.get<ConnectionManager>(ConnectionManager);
  });

  describe('connect', () => {
    it('应该成功建立连接', async () => {
      await manager.connect();
      
      expect(mockLogger.log).toHaveBeenCalledWith(
        '数据库连接成功',
        expect.objectContaining({
          host: 'localhost',
          database: 'test_db',
        })
      );
    });

    it('应该在连接失败时抛出异常', async () => {
      mockOrm.isConnected.mockRejectedValue(new Error('Connection failed'));

      await expect(manager.connect()).rejects.toThrow(DatabaseConnectionException);
    });
  });

  describe('disconnect', () => {
    it('应该优雅关闭连接', async () => {
      await manager.disconnect();
      
      expect(mockOrm.close).toHaveBeenCalledWith(true);
      expect(mockLogger.log).toHaveBeenCalledWith('数据库连接已关闭');
    });

    it('应该处理关闭失败的情况', async () => {
      mockOrm.close.mockRejectedValue(new Error('Close failed'));

      await expect(manager.disconnect()).rejects.toThrow(DatabaseConnectionException);
    });
  });

  describe('isConnected', () => {
    it('应该返回连接状态', async () => {
      const connected = await manager.isConnected();
      expect(connected).toBe(true);
      expect(mockOrm.isConnected).toHaveBeenCalled();
    });
  });

  describe('getConnectionInfo', () => {
    it('应该返回连接信息', async () => {
      const info = await manager.getConnectionInfo();
      
      expect(info).toHaveProperty('status');
      expect(info).toHaveProperty('type');
      expect(info).toHaveProperty('host');
      expect(info).toHaveProperty('port');
      expect(info).toHaveProperty('database');
      expect(info).toHaveProperty('poolStats');
    });
  });
});

