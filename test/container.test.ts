import { Container } from "../src/shared/backend/core/container";

describe("Container", () => {
  it("should register and retrieve a service", () => {
    const mockService = { hello: () => "world" };
    Container.register("mock", mockService);

    const retrieved = Container.get<typeof mockService>("mock");
    expect(retrieved).toBe(mockService);
    expect(retrieved.hello()).toBe("world");
  });

  it("should throw error when service not found", () => {
    expect(() => Container.get("non-existent")).toThrow("Service not found: non-existent");
  });
});
