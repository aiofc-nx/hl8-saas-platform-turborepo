/**
 * FileLoader 单元测试
 */

import { FileLoader, fileLoader } from './file.loader.js';
import { GeneralBadRequestException } from '../../exceptions/core/general-bad-request.exception.js';
import { readFileSync } from 'fs';

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn((content) => ({ parsed: content })),
}));

describe('FileLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('load - YAML files', () => {
    it('应该加载 .yml 文件', async () => {
      const mockContent = 'key: value';
      (readFileSync as jest.Mock).mockReturnValue(mockContent);

      const loader = new FileLoader({ path: '/config/app.yml' });
      const result = await loader.load();

      expect(result).toEqual({ parsed: mockContent });
      expect(readFileSync).toHaveBeenCalledWith('/config/app.yml', 'utf-8');
    });

    it('应该加载 .yaml 文件', async () => {
      const mockContent = 'key: value';
      (readFileSync as jest.Mock).mockReturnValue(mockContent);

      const loader = new FileLoader({ path: '/config/app.yaml' });
      const result = await loader.load();

      expect(result).toEqual({ parsed: mockContent });
    });
  });

  describe('load - JSON files', () => {
    it('应该加载 .json 文件', async () => {
      const mockContent = '{"key": "value"}';
      (readFileSync as jest.Mock).mockReturnValue(mockContent);

      const loader = new FileLoader({ path: '/config/app.json' });
      const result = await loader.load();

      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('load - unsupported files', () => {
    it('不支持的文件类型应该抛出异常', () => {
      (readFileSync as jest.Mock).mockReturnValue('content');
      const loader = new FileLoader({ path: '/config/app.txt' });

      expect(() => loader.load()).toThrow(GeneralBadRequestException);
    });

    it('异常应该包含详细信息', () => {
      (readFileSync as jest.Mock).mockReturnValue('content');
      const loader = new FileLoader({ path: '/config/app.xml' });

      try {
        loader.load();
        fail('Should throw exception');
      } catch (error) {
        expect(error).toBeInstanceOf(GeneralBadRequestException);
        expect((error as GeneralBadRequestException).data.path).toBe('/config/app.xml');
        expect((error as GeneralBadRequestException).data.supportedFormats).toContain('.yml');
      }
    });
  });

  describe('fileLoader helper', () => {
    it('应该创建 FileLoader 实例', () => {
      const loader = fileLoader({ path: '/config/app.yml' });

      expect(loader).toBeInstanceOf(FileLoader);
    });
  });
});

