/**
 * 用例接口
 *
 * @description 定义所有用例的基础接口
 *
 * @interface IUseCase
 * @since 1.0.0
 */

export interface IUseCase<TRequest, TResponse> {
  /**
   * 执行用例
   *
   * @param request - 请求参数
   * @returns 用例执行结果
   */
  execute(request: TRequest): Promise<TResponse>;
}

/**
 * 命令用例接口
 *
 * @description 定义命令用例的基础接口
 *
 * @interface ICommandUseCase
 * @since 1.0.0
 */
export interface ICommandUseCase<TRequest, TResponse>
  extends IUseCase<TRequest, TResponse> {
  /**
   * 执行命令用例
   *
   * @param request - 请求参数
   * @returns 用例执行结果
   */
  execute(request: TRequest): Promise<TResponse>;
}

/**
 * 查询用例接口
 *
 * @description 定义查询用例的基础接口
 *
 * @interface IQueryUseCase
 * @since 1.0.0
 */
export interface IQueryUseCase<TRequest, TResponse>
  extends IUseCase<TRequest, TResponse> {
  /**
   * 执行查询用例
   *
   * @param request - 请求参数
   * @returns 用例执行结果
   */
  execute(request: TRequest): Promise<TResponse>;
}
