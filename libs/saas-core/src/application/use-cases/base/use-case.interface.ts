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