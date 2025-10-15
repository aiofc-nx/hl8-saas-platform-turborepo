/**
 * @fileoverview 压缩中间件模块
 */

import { DynamicModule, Global, Module } from "@nestjs/common";
import type { CompressionOptions } from "./types/compression-options.js";
import { DEFAULT_COMPRESSION_OPTIONS } from "./types/compression-options.js";

@Global()
@Module({})
export class CompressionModule {
  static forRoot(options?: CompressionOptions): DynamicModule {
    const mergedOptions: CompressionOptions = {
      ...DEFAULT_COMPRESSION_OPTIONS,
      ...options,
    };

    return {
      module: CompressionModule,
      global: true,
      providers: [
        {
          provide: "COMPRESSION_OPTIONS",
          useValue: mergedOptions,
        },
      ],
      exports: ["COMPRESSION_OPTIONS"],
    };
  }
}
