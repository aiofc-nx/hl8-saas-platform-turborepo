/**
 * 用户服务
 * 
 * @description 演示缓存装饰器的使用
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Cacheable, CacheEvict, CachePut } from '@hl8/caching';
import type { User, CreateUserDto, UpdateUserDto } from './user.entity.js';

@Injectable()
export class UsersService {
  // 模拟数据库
  private users: Map<string, User> = new Map();
  private idCounter = 1;

  constructor() {
    // 初始化一些示例数据
    this.seedData();
  }

  /**
   * 获取所有用户（自动缓存）
   * 
   * @description 使用 @Cacheable 装饰器自动缓存用户列表
   * 缓存键会自动包含租户/组织信息，实现数据隔离
   */
  @Cacheable('users', { ttl: 600 }) // 缓存 10 分钟
  async findAll(): Promise<User[]> {
    console.log('📊 从"数据库"查询所有用户...');
    // 模拟数据库延迟
    await this.delay(100);
    return Array.from(this.users.values());
  }

  /**
   * 根据 ID 获取用户（自动缓存）
   * 
   * @description 使用 @Cacheable 装饰器自动缓存单个用户
   * 缓存未命中时才查询数据库
   */
  @Cacheable('users')
  async findOne(id: string): Promise<User> {
    console.log(`📊 从"数据库"查询用户 ${id}...`);
    // 模拟数据库延迟
    await this.delay(50);
    
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    return user;
  }

  /**
   * 创建用户（清除列表缓存）
   * 
   * @description 使用 @CacheEvict 装饰器自动清除用户列表缓存
   * 创建新用户后，列表缓存会失效，下次查询会重新获取
   */
  @CacheEvict('users', {
    keyGenerator: () => 'list', // 清除列表缓存
  })
  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('📝 创建新用户...');
    
    const id = String(this.idCounter++);
    const user: User = {
      id,
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  /**
   * 更新用户（更新缓存）
   * 
   * @description 使用 @CachePut 装饰器自动更新缓存
   * 更新用户后，缓存会立即刷新为最新数据
   */
  @CachePut('users')
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    console.log(`📝 更新用户 ${id}...`);
    
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    
    const updatedUser: User = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * 删除用户（清除缓存）
   * 
   * @description 使用 @CacheEvict 装饰器自动清除用户缓存
   */
  @CacheEvict('users')
  async remove(id: string): Promise<void> {
    console.log(`🗑️  删除用户 ${id}...`);
    
    if (!this.users.has(id)) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    
    this.users.delete(id);
  }

  /**
   * 初始化示例数据
   * @private
   */
  private seedData(): void {
    const users: User[] = [
      {
        id: '1',
        name: '张三',
        email: 'zhangsan@example.com',
        age: 28,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: '李四',
        email: 'lisi@example.com',
        age: 32,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: '王五',
        email: 'wangwu@example.com',
        age: 25,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ];

    users.forEach((user) => {
      this.users.set(user.id, user);
      this.idCounter = Math.max(this.idCounter, parseInt(user.id, 10) + 1);
    });
  }

  /**
   * 模拟延迟
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

