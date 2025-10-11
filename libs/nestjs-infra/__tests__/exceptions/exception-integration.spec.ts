/**
 * 异常处理系统集成测试
 *
 * @description 测试异常模块的集成功能
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - 测试文件中的装饰器类型推断问题不影响运行时

import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { ExceptionModule } from '../../src/exceptions/exception.module.js';
import { GeneralNotFoundException } from '../../src/exceptions/core/general-not-found.exception.js';
import { GeneralBadRequestException } from '../../src/exceptions/core/general-bad-request.exception.js';
import { GeneralInternalServerException } from '../../src/exceptions/core/general-internal-server.exception.js';
import request from 'supertest';

// 测试控制器
@Controller('test')
class TestController {
  @Get('not-found')
  notFound(): void {
    throw new GeneralNotFoundException(
      '资源未找到',
      'ID 为 "test-123" 的资源不存在',
      { resourceId: 'test-123' },
    );
  }

  @Get('bad-request')
  badRequest(): void {
    throw new GeneralBadRequestException(
      '参数错误',
      '邮箱格式不正确',
      { email: 'invalid' },
    );
  }

  @Get('internal-error')
  internalError(): void {
    throw new GeneralInternalServerException(
      '服务器错误',
      '数据库连接失败',
      { operation: 'query' },
    );
  }

  @Get('unknown-error')
  unknownError(): void {
    throw new Error('未预期的错误');
  }

  @Get('success')
  success(): { message: string } {
    return { message: 'success' };
  }
}

describe('异常处理系统集成测试', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ExceptionModule.forRoot({
          enableLogging: false, // 禁用日志避免测试输出
          isProduction: false, // 开发模式，显示详细错误
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HttpExceptionFilter', () => {
    it('应该捕获 GeneralNotFoundException 并返回 RFC7807 格式', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/not-found')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        type: 'https://docs.hl8.com/errors#NOT_FOUND',
        title: '资源未找到',
        detail: 'ID 为 "test-123" 的资源不存在',
        status: 404,
        errorCode: 'NOT_FOUND',
        data: { resourceId: 'test-123' },
      });
      expect(response.body).toHaveProperty('instance');
      expect(response.headers['content-type']).toContain(
        'application/problem+json',
      );
    });

    it('应该捕获 GeneralBadRequestException', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/bad-request')
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        errorCode: 'BAD_REQUEST',
        title: '参数错误',
        detail: '邮箱格式不正确',
        status: 400,
        data: { email: 'invalid' },
      });
    });

    it('应该捕获 GeneralInternalServerException', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/internal-error')
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
        title: '服务器错误',
        detail: '数据库连接失败',
        status: 500,
        data: { operation: 'query' },
      });
    });
  });

  describe('AnyExceptionFilter', () => {
    it('应该捕获未知错误并转换为 500', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/unknown-error')
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
        status: 500,
      });
      expect(response.body.detail).toContain('未预期的错误');
      expect(response.headers['content-type']).toContain(
        'application/problem+json',
      );
    });
  });

  describe('正常响应', () => {
    it('应该正常处理成功请求', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/success')
        .expect(200);

      // Assert
      expect(response.body).toEqual({ message: 'success' });
    });
  });

  describe('RFC7807 标准验证', () => {
    it('所有异常响应应包含 RFC7807 必需字段', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/test/not-found')
        .expect(404);

      // Assert - RFC7807 必需字段
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('status');

      // Assert - 自定义扩展字段
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('detail');
    });

    it('响应头应设置正确的 Content-Type', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/test/not-found',
      );

      // Assert
      expect(response.headers['content-type']).toMatch(
        /application\/problem\+json/,
      );
    });
  });
});

describe('异常处理系统 - 异步配置', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ExceptionModule.forRootAsync({
          useFactory: async () => ({
            enableLogging: false,
            isProduction: false,
          }),
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('应该通过异步配置正常工作', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/test/not-found')
      .expect(404);

    // Assert
    expect(response.body).toHaveProperty('errorCode', 'NOT_FOUND');
  });
});

