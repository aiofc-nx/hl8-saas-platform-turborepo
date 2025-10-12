/**
 * 用户控制器
 * 
 * @description 演示缓存装饰器在实际 REST API 中的使用
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import type { User, CreateUserDto, UpdateUserDto } from './user.entity.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取所有用户
   * 
   * @description 第一次请求会查询数据库并缓存
   * 后续请求直接返回缓存数据（除非缓存过期或被清除）
   * 不同租户的请求会自动隔离缓存
   */
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * 根据 ID 获取用户
   * 
   * @description 演示单个资源的缓存
   * 缓存键自动包含用户 ID 和隔离上下文
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /**
   * 创建用户
   * 
   * @description 创建后自动清除用户列表缓存
   * 确保下次查询列表时能看到新用户
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * 更新用户
   * 
   * @description 更新后自动刷新用户缓存
   * 确保下次查询时能获取到最新数据
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * 删除用户
   * 
   * @description 删除后自动清除用户缓存
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

