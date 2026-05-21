/**
 * @description Repository インターフェース
 * @author yoshitaka
 * @export
 * @interface IRepository
 * @template T
 */
export interface IRepository<T> {
  /**
   * すべてのレコードを取得
   */
  getAll(): T[];

  /**
   * IDでレコードを取得
   */
  getById(id: string | number): T | null;

  /**
   * レコードを作成
   */
  create(entity: T): void;

  /**
   * レコードを更新
   */
  update(id: string | number, entity: Partial<T>): void;

  /**
   * レコードを削除
   */
  delete(id: string | number): void;
}
