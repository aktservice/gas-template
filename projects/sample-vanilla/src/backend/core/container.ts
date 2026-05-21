/**
 * Simple Dependency Injection Container
 */
export class Container {
  private static services = new Map<string, any>();

  static register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  static get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${key}`);
    }
    return service as T;
  }
}
