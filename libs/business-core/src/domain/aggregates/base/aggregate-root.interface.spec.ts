import {
  IAggregateRoot,
  IAggregateRepository,
  IAggregateEventStore,
  AggregateMetadata,
  AggregateVersion,
  AggregateSnapshot,
} from "./aggregate-root.interface.js";
import { EntityId } from "@hl8/isolation-model";

describe("Aggregate Root Interface", () => {
  describe("IAggregateRoot", () => {
    it("应该定义聚合根接口方法", () => {
      const aggregate: IAggregateRoot = {
        getId: jest.fn(),
        getVersion: jest.fn(),
        getUncommittedEvents: jest.fn(),
        markEventsAsCommitted: jest.fn(),
        loadFromHistory: jest.fn(),
        takeSnapshot: jest.fn(),
        restoreFromSnapshot: jest.fn(),
      };

      expect(aggregate.getId).toBeDefined();
      expect(aggregate.getVersion).toBeDefined();
      expect(aggregate.getUncommittedEvents).toBeDefined();
      expect(aggregate.markEventsAsCommitted).toBeDefined();
      expect(aggregate.loadFromHistory).toBeDefined();
      expect(aggregate.takeSnapshot).toBeDefined();
      expect(aggregate.restoreFromSnapshot).toBeDefined();
    });
  });

  describe("IAggregateRepository", () => {
    it("应该定义聚合根仓储接口方法", () => {
      const repository: IAggregateRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
      };

      expect(repository.save).toBeDefined();
      expect(repository.findById).toBeDefined();
      expect(repository.delete).toBeDefined();
      expect(repository.exists).toBeDefined();
    });
  });

  describe("IAggregateEventStore", () => {
    it("应该定义聚合事件存储接口方法", () => {
      const eventStore: IAggregateEventStore = {
        saveEvents: jest.fn(),
        getEvents: jest.fn(),
        getEventsFromVersion: jest.fn(),
        saveSnapshot: jest.fn(),
        getSnapshot: jest.fn(),
      };

      expect(eventStore.saveEvents).toBeDefined();
      expect(eventStore.getEvents).toBeDefined();
      expect(eventStore.getEventsFromVersion).toBeDefined();
      expect(eventStore.saveSnapshot).toBeDefined();
      expect(eventStore.getSnapshot).toBeDefined();
    });
  });

  describe("AggregateMetadata", () => {
    it("应该定义聚合元数据", () => {
      const metadata: AggregateMetadata = {
        id: EntityId.generate(),
        type: "TestAggregate",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(metadata.id).toBeDefined();
      expect(metadata.type).toBe("TestAggregate");
      expect(metadata.version).toBe(1);
      expect(metadata.createdAt).toBeInstanceOf(Date);
      expect(metadata.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("AggregateVersion", () => {
    it("应该定义聚合版本", () => {
      const version: AggregateVersion = {
        current: 1,
        expected: 0,
        next: 2,
      };

      expect(version.current).toBe(1);
      expect(version.expected).toBe(0);
      expect(version.next).toBe(2);
    });
  });

  describe("AggregateSnapshot", () => {
    it("应该定义聚合快照", () => {
      const snapshot: AggregateSnapshot = {
        aggregateId: EntityId.generate(),
        version: 1,
        data: { state: "test" },
        createdAt: new Date(),
      };

      expect(snapshot.aggregateId).toBeDefined();
      expect(snapshot.version).toBe(1);
      expect(snapshot.data).toEqual({ state: "test" });
      expect(snapshot.createdAt).toBeInstanceOf(Date);
    });
  });
});
