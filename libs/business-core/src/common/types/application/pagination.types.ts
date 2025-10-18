/**
 * 分页选项
 */
export interface PaginationOptions {
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: Record<string, any>;
  /** 是否包含总数 */
  includeTotal?: boolean;
  /** 缓存时间（秒） */
  cacheTtl?: number;
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
  /** 下一页页码 */
  nextPage?: number;
  /** 上一页页码 */
  prevPage?: number;
}

/**
 * 游标分页选项
 */
export interface CursorPaginationOptions {
  /** 游标 */
  cursor?: string;
  /** 每页数量 */
  limit: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: Record<string, any>;
  /** 缓存时间（秒） */
  cacheTtl?: number;
}

/**
 * 游标分页结果
 */
export interface CursorPaginationResult<T> {
  /** 数据列表 */
  data: T[];
  /** 下一页游标 */
  nextCursor?: string;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 每页数量 */
  limit: number;
}
