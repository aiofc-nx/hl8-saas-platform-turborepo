import { EntityId } from "@hl8/business-core";
import { DepartmentAggregate } from "./department.aggregate";

describe("DepartmentAggregate", () => {
  it("应该创建部门聚合根", () => {
    const aggregate = DepartmentAggregate.createRoot(
      EntityId.generate(),
      EntityId.generate(),
      "HQ",
      "总部",
      { createdBy: "system" },
    );

    expect(aggregate).toBeDefined();
  });
});
